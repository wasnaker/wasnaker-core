import { cpSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const target = mkdtempSync(join(tmpdir(), "wasnaker-core-standalone-"));
cpSync(root, target, {
  recursive: true,
  filter: (path) => !["node_modules", "dist", ".git"].includes(basename(path)),
});
console.log(`Standalone core checkout: ${target}`);
for (const args of [
  ["ci", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"],
  ["test"],
]) {
  const result = spawnSync("npm", args, {
    cwd: target,
    stdio: "inherit",
    env: { ...process.env, CI: "true" },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
