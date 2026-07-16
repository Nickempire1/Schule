import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import { apiRouter } from "./routes/api";
import { initSocketHandlers } from "./socketHandlers";
import { loadAllFromDisk } from "./game/sessionStore";

loadAllFromDisk();

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, "..", "data", "uploads");
app.use("/uploads", express.static(UPLOAD_DIR));

app.use("/api", apiRouter);

const PUBLIC_DIR = path.join(__dirname, "..", "public");
app.use(express.static(PUBLIC_DIR));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    next();
    return;
  }
  res.sendFile(path.join(PUBLIC_DIR, "index.html"), (err) => {
    if (err) next();
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8,
});

initSocketHandlers(io);

const PORT = Number(process.env.PORT) || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Jet Lag Schweiz Server läuft auf Port ${PORT}`);
  console.log(`Lokal erreichbar unter http://localhost:${PORT}`);
});
