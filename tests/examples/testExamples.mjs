/* global console, process */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filePath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(filePath), "../..");
const examplesDir = path.join(rootDir, "examples");
const distTypes = path.join(rootDir, "dist", "esm", "index.d.ts");

const exampleFiles = readdirSync(examplesDir)
  .filter((name) => name.endsWith(".example.ts"))
  .map((name) => path.join(examplesDir, name));

if (!exampleFiles.length) {
  console.log("No example files found.");
  process.exit(0);
}

if (!existsSync(distTypes)) {
  console.log("dist types missing; building package...");
  execFileSync("npm", ["run", "build"], {
    cwd: rootDir,
    stdio: "inherit",
  });
}

const baseConfig = JSON.parse(
  readFileSync(path.join(rootDir, "tsconfig.json"), "utf8"),
);

const tempDir = mkdtempSync(path.join(tmpdir(), "css-calipers-examples-"));
const tempConfigPath = path.join(tempDir, "tsconfig.examples.json");

const tempConfig = {
  ...baseConfig,
  compilerOptions: {
    ...baseConfig.compilerOptions,
    noEmit: true,
    baseUrl: rootDir,
    paths: {
      "css-calipers": ["dist/esm/index.d.ts"],
      "css-calipers/*": ["dist/esm/*"],
    },
    types: ["node"],
    typeRoots: [path.join(rootDir, "node_modules", "@types")],
    strict: true,
    noImplicitAny: true,
  },
  include: exampleFiles,
};

writeFileSync(tempConfigPath, JSON.stringify(tempConfig, null, 2));

const tscBin = path.join(
  rootDir,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsc.cmd" : "tsc",
);

const result = spawnSync(tscBin, ["-p", tempConfigPath], {
  cwd: rootDir,
  stdio: "inherit",
});

rmSync(tempDir, { recursive: true, force: true });

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("Example type checks passed.");
