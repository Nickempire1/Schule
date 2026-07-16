import { useEffect, useState } from "react";

function formatDuration(ms: number): string {
  const sign = ms < 0 ? "-" : "";
  const abs = Math.abs(ms);
  const totalSeconds = Math.floor(abs / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${sign}${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${sign}${m}:${String(s).padStart(2, "0")}`;
}

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function CountdownTo({ target, className }: { target: number; className?: string }) {
  const now = useNow();
  const remaining = target - now;
  return (
    <span className={`mono ${className ?? ""}`} style={{ color: remaining < 0 ? "var(--red)" : undefined }}>
      {formatDuration(remaining)}
    </span>
  );
}

export function CountUpFrom({
  start,
  pausedMs = 0,
  pausedSince,
  className,
}: {
  start: number;
  pausedMs?: number;
  pausedSince?: number;
  className?: string;
}) {
  const now = useNow();
  const ongoingPause = pausedSince ? now - pausedSince : 0;
  const elapsed = Math.max(0, now - start - pausedMs - ongoingPause);
  return <span className={`mono ${className ?? ""}`}>{formatDuration(elapsed)}</span>;
}
