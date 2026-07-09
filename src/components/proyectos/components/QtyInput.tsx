import { useEffect, useState } from "react";

export function QtyInput({
  value,
  onChange,
  style,
  autoFocus,
}: {
  value: number;
  onChange: (n: number) => void;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}) {
  const [raw, setRaw] = useState(String(value));

  useEffect(() => {
    setRaw(String(value));
  }, [value]);

  const commit = () => {
    const n = parseInt(raw, 10);
    if (!raw || Number.isNaN(n) || n < 1) {
      setRaw(String(value));
    } else if (n !== value) {
      onChange(n);
    }
  };

  return (
    <input
      type="number"
      min={1}
      autoFocus={autoFocus}
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
      style={style}
    />
  );
}
