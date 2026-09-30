// 훅 공용 유틸: stdin JSON 읽기, 하네스 상태 파일 관리.
import fs from "node:fs";
import path from "node:path";

export const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const STATE_DIR = path.join(ROOT, ".claude", ".harness-state");

export async function readInput() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

export function readState() {
  try {
    return JSON.parse(fs.readFileSync(path.join(STATE_DIR, "state.json"), "utf8"));
  } catch {
    return { dirty: [], stopBlocks: 0 };
  }
}

export function writeState(state) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(path.join(STATE_DIR, "state.json"), JSON.stringify(state, null, 2));
}

export function relPath(file) {
  return path.relative(ROOT, path.resolve(ROOT, file)).split(path.sep).join("/");
}

/** 도구 호출을 거부한다. stderr 내용이 Claude에게 전달된다. */
export function deny(reason) {
  process.stderr.write(`[harness] 차단됨: ${reason}\n`);
  process.exit(2);
}
