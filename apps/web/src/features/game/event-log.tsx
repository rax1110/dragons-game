import styles from './event-log.module.css';
import { useGameStore } from './game-store.ts';

export const EventLog = () => {
  const events = useGameStore((store) => store.events);

  return (
    <section className={styles.log} aria-label="Event log" data-panel>
      <ol aria-live="polite">
        {events.length === 0 && <li>Pick a quest to begin.</li>}
        {events.toReversed().map((event) => (
          <li
            key={event.state.turn}
            data-failed={!event.succeeded || undefined}
          >
            <span>Turn {event.state.turn}</span>
            {event.message}
          </li>
        ))}
      </ol>
    </section>
  );
};
