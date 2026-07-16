import { useRef, useState } from "react";
import { uploadMedia } from "../lib/api";
import { useGameStore } from "../store/useGameStore";

export default function MediaCapture({
  kind,
  onUploaded,
}: {
  kind: "PHOTO" | "VIDEO" | "AUDIO";
  onUploaded: (url: string) => void;
}) {
  const code = useGameStore((s) => s.code);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  async function doUpload(blob: Blob, filename: string) {
    if (!code) return;
    setBusy(true);
    try {
      const url = await uploadMedia(code, blob, filename);
      setPreviewUrl(URL.createObjectURL(blob));
      onUploaded(url);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) doUpload(file, file.name);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => chunksRef.current.push(ev.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        doUpload(blob, "aufnahme.webm");
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      alert("Mikrofonzugriff nicht möglich: " + (err as Error).message);
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  if (kind === "AUDIO") {
    return (
      <div className="stack">
        <div className="row">
          {!recording ? (
            <button className="btn btn--secondary" onClick={startRecording} disabled={busy}>
              🎙️ Aufnahme starten
            </button>
          ) : (
            <button className="btn btn--danger" onClick={stopRecording}>
              ⏹ Stopp &amp; hochladen
            </button>
          )}
          {busy && <span className="spinner" />}
        </div>
        {previewUrl && <audio controls src={previewUrl} style={{ width: "100%" }} />}
      </div>
    );
  }

  const accept = kind === "PHOTO" ? "image/*" : "video/*";

  return (
    <div className="stack">
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        capture="environment"
        style={{ display: "none" }}
        onChange={onFileChosen}
      />
      <button className="btn btn--secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
        {kind === "PHOTO" ? "📷 Foto aufnehmen" : "🎥 Video aufnehmen"}
      </button>
      {busy && <span className="spinner" />}
      {previewUrl &&
        (kind === "PHOTO" ? (
          <img src={previewUrl} alt="Vorschau" style={{ width: "100%", borderRadius: 12 }} />
        ) : (
          <video src={previewUrl} controls style={{ width: "100%", borderRadius: 12 }} />
        ))}
    </div>
  );
}
