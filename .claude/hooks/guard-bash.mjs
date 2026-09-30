// PreToolUse(Bash): 되돌리기 어려운 명령을 차단한다.
// heredoc 본문이나 echo 문자열 속 텍스트는 명령이 아니므로, 명령 위치(세그먼트 맨 앞)만 검사한다.
import { readInput, deny } from "./lib.mjs";

const { tool_input: { command = "" } = {} } = await readInput();

function stripHeredocs(cmd) {
  const lines = cmd.split("\n");
  const kept = [];
  let terminator = null;
  for (const line of lines) {
    if (terminator) {
      if (line.trim() === terminator) terminator = null;
      continue;
    }
    kept.push(line);
    const m = line.match(/<<-?\s*['"]?(\w+)['"]?/);
    if (m) terminator = m[1];
  }
  return kept.join("\n");
}

const code = stripHeredocs(command);
const segments = code
  .split(/\n|;|&&|\|\||\||\$\(|`/)
  .map((s) => s.trim().replace(/^(sudo|\(|\{)\s*/, ""));

const segmentRules = [
  [/^rm\s+-[a-z]*r[a-z]*\s+(\/|~|\.|\*|\$HOME)(\s|$)/i, "루트/홈/프로젝트 전체 재귀 삭제"],
  [/^rm\b.*backend\/data/, "로컬 DB(backend/data) 삭제 — 필요하면 DB_PATH로 임시 DB를 쓰세요"],
  [/^git\s+push\b.*(--force(?!-with-lease)|\s-f\b)/, "force push — 필요하면 --force-with-lease를 쓰세요"],
  [/^git\s+reset\s+--hard\b/, "git reset --hard — 작업 내용이 사라집니다"],
  [/^git\s+(commit|push)\b.*--no-verify/, "--no-verify로 검증 우회"],
  [/^git\s+clean\s+-[a-z]*f/, "git clean -f — 추적되지 않는 파일이 삭제됩니다"],
];

for (const segment of segments) {
  for (const [pattern, reason] of segmentRules) {
    if (pattern.test(segment)) deny(reason);
  }
}
if (/^\s*sqlite3\b.*\bDROP\s+TABLE\b/im.test(code)) deny("DROP TABLE");
process.exit(0);
