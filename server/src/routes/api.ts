import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { buildGameData } from "../game/gamedata";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "data", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const code = String((_req.params as any).code || "misc").toUpperCase();
    const dir = path.join(UPLOAD_DIR, code);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, `${Date.now()}_${nanoid(8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 120 * 1024 * 1024 },
});

export const apiRouter = Router();

apiRouter.get("/gamedata", (_req, res) => {
  res.json(buildGameData());
});

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true, time: Date.now() });
});

apiRouter.post("/sessions/:code/media", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Keine Datei erhalten." });
    return;
  }
  const code = String(req.params.code).toUpperCase();
  const url = `/uploads/${code}/${req.file.filename}`;
  res.json({ url });
});
