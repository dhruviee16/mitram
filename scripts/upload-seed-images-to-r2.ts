import "dotenv/config";
import { readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import { uploadToR2 } from "../src/server/r2";

const SEED_IMAGE_DIRS = ["public/images/trips", "public/images/brand"];

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function main() {
  const mapping: Record<string, string> = {};

  for (const dir of SEED_IMAGE_DIRS) {
    const absDir = path.join(process.cwd(), dir);
    let files: string[];
    try {
      files = await readdir(absDir);
    } catch {
      continue;
    }

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const contentType = CONTENT_TYPES[ext];
      if (!contentType) continue;

      const localPath = path.join(absDir, file);
      const bytes = await readFile(localPath);
      const key = `seed/${path.basename(dir)}/${file}`;
      const url = await uploadToR2(key, bytes, contentType);

      const originalUrlPath = `/${dir.replace("public/", "")}/${file}`;
      mapping[originalUrlPath] = url;
      console.log(`${originalUrlPath} -> ${url}`);
    }
  }

  const outPath = path.join(process.cwd(), "scripts", ".r2-image-mapping.json");
  await writeFile(outPath, JSON.stringify(mapping, null, 2));
  console.log(`\nWrote mapping (local path -> R2 URL) to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
