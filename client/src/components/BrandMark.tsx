export default function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <div className="brand__mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 512 512" width={size * 0.6} height={size * 0.6}>
        <rect x="196" y="176" width="120" height="120" rx="18" fill="#e8112d" />
        <rect x="234" y="196" width="44" height="80" fill="#ffffff" />
        <rect x="216" y="214" width="80" height="44" fill="#ffffff" />
        <circle cx="256" cy="256" r="118" fill="none" stroke="#f4f6f8" strokeWidth="16" />
        <line x1="340" y1="340" x2="420" y2="420" stroke="#f4f6f8" strokeWidth="26" strokeLinecap="round" />
      </svg>
    </div>
  );
}
