import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputUrl = new URL(
  '../dist/esm/package.json',
  import.meta.url,
);
const outputPath = fileURLToPath(outputUrl);
const outputDir = dirname(outputPath);

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, '{\n  "type": "module"\n}\n', 'utf8');
