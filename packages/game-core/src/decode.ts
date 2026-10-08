import { AdIdSchema, Encoding, type Ad, type RawAd } from './game-api.ts';

const utf8 = new TextDecoder('utf-8', { fatal: true });

const decodeBase64 = (text: string) =>
  utf8.decode(Uint8Array.from(atob(text), (char) => char.charCodeAt(0)));

const decodeRot13 = (text: string) =>
  text.replace(/[a-z]/gi, (char) => {
    const base = char < 'a' ? 65 : 97;

    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
  });

type Decoder = { encoding: Encoding; decode: (text: string) => string };

const DECODERS = new Map<number, Decoder>([
  [1, { encoding: Encoding.Base64, decode: decodeBase64 }],
  [2, { encoding: Encoding.Rot13, decode: decodeRot13 }],
]);

const buildAd = (
  { adId, message, reward, expiresIn, probability }: RawAd,
  encoding: Encoding,
): Ad | null => {
  const parsed = AdIdSchema.safeParse(adId);

  return parsed.success
    ? { adId: parsed.data, message, reward, expiresIn, probability, encoding }
    : null;
};

export const decodeAd = (raw: RawAd): Ad | null => {
  if (!raw.encrypted) return buildAd(raw, Encoding.Plain);

  const decoder = DECODERS.get(raw.encrypted);

  if (!decoder) return null;

  try {
    const decoded = {
      ...raw,
      adId: decoder.decode(raw.adId),
      message: decoder.decode(raw.message),
      probability: decoder.decode(raw.probability),
    };

    return buildAd(decoded, decoder.encoding);
  } catch {
    return null;
  }
};

export const decodeAds = (ads: readonly RawAd[]): Ad[] =>
  ads.flatMap((ad) => decodeAd(ad) ?? []);
