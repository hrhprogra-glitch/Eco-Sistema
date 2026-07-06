import styles from "./AlphabetFilter.module.css";

const LETTERS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

export function AlphabetFilter({
  active,
  available,
  onSelect,
}: {
  active: string | null;
  available: Set<string>;
  onSelect: (letter: string | null) => void;
}) {
  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`${styles.letter} ${active === null ? styles.active : ""}`}
      >
        Todos
      </button>
      {LETTERS.map((letter) => (
        <button
          key={letter}
          type="button"
          disabled={!available.has(letter)}
          onClick={() => onSelect(letter)}
          className={`${styles.letter} ${active === letter ? styles.active : ""}`}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
