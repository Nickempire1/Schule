import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrCode({ text, size = 168 }: { text: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: { dark: "#0b121bff", light: "#f4f7faff" },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [text, size]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className="panel--tight" />;
  }
  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt="QR-Code zum Beitreten"
      style={{ borderRadius: 12, display: "block" }}
    />
  );
}
