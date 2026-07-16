import { useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

export default function Toast() {
  const { error, setError } = useGameStore();

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4200);
    return () => clearTimeout(t);
  }, [error]);

  if (!error) return null;
  return (
    <div className="toast toast--error" onClick={() => setError(null)}>
      {error}
    </div>
  );
}
