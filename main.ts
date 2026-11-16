import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const target = join(outDir, "entry.png");

if (!existsSync(source)) {
  console.error(`error: entry image not found at ${source}`);
  process.exit(1);
}
const head = readFileSync(source).subarray(0, 3);
if (head[0] !== 0xff || head[1] !== 0xd8 || head[2] !== 0xff) {
  console.error("error: entry.png is not a JPEG (expected magic bytes FF D8 FF)");
  process.exit(1);
}
const size = statSync(source).size;
if (size > 1048576) {
  console.error(`error: entry.png is ${size} bytes, over the 1 MiB limit`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);
const copied = readFileSync(target);
if (copied.length !== size || copied.subarray(0, 3).toString("hex") !== "ffd8ff") {
  console.error("error: copied output failed verification (size or JPEG header mismatch)");
  process.exit(1);
}
console.log(`wrote ${target} (${statSync(target).size} bytes)`);
