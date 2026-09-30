// PostToolUse(Edit|Write|MultiEdit): 변경된 패키지를 "dirty"로 기록하고,
// 프론트엔드 파일이면 즉시 oxlint로 빠른 피드백을 준다. 무거운 검증은 Stop 게이트가 한다.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { readInput, readState, writeState, relPath, ROOT } from "./lib.mjs";

const { tool_input: { file_path = "" } = {} } = await readInput();
if (!file_path) process.exit(0);
const rel = relPath(file_path);
const scope = rel.startsWith("backend/") ? "backend" : rel.startsWith("frontend/") ? "frontend" : null;
if (!scope) process.exit(0);

const state = readState();
if (!state.dirty.includes(scope)) state.dirty.push(scope);
writeState(state);

if (scope === "frontend" && /\.(tsx?|jsx?)$/.test(rel)) {
  try {
    execFileSync("npx", ["oxlint", "--deny-warnings", path.relative("frontend", rel)], {
      cwd: path.join(ROOT, "frontend"),
      stdio: "pipe",
    });
  } catch (err) {
    process.stderr.write(`[harness] oxlint 경고/오류 (${rel}):\n${err.stdout ?? ""}${err.stderr ?? ""}`);
    process.exit(2);
  }
}
process.exit(0);
