// PreToolUse(Edit|Write|MultiEdit): 손으로 고치면 안 되는 파일을 보호한다.
import { readInput, relPath, deny } from "./lib.mjs";

const { tool_input: { file_path = "" } = {} } = await readInput();
if (!file_path) process.exit(0);
const rel = relPath(file_path);

const rules = [
  [/(^|\/)\.env(\.|$)/, "비밀 값 파일(.env)"],
  [/(^|\/)package-lock\.json$/, "lockfile — npm install로만 갱신하세요"],
  [/^backend\/data\//, "로컬 SQLite 데이터"],
  [/(^|\/)(dist|node_modules)\//, "빌드 산출물/의존성"],
  [/^\.git\//, ".git 내부"],
];

for (const [pattern, reason] of rules) {
  if (pattern.test(rel)) deny(`${rel} 수정 금지 (${reason})`);
}
process.exit(0);
