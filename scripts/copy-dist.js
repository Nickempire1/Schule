const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "client", "dist");
const dest = path.join(__dirname, "..", "server", "public");

if (!fs.existsSync(src)) {
  console.error("client/dist not found - run the client build first.");
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`Copied ${src} -> ${dest}`);
