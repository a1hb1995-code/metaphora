// Stop: 이번 세션에서 코드가 바뀌었다면 harness/check.sh를 통과해야만 종료할 수 있다.
// 무한 루프 방지를 위해 연속 차단은 MAX_BLOCKS회로 제한한다.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { readInput, readState, writeState, ROOT } from "./lib.mjs";

const MAX_BLOCKS = 3;
await readInput();
const state = readState();
if (state.dirty.length === 0) process.exit(0);

const scope = state.dirty.length === 1 ? state.dirty[0] : "all";
const result = spawnSync(path.join(ROOT, "harness", "check.sh"), ["--scope", scope, "--fast"], {
  cwd: ROOT,
  encoding: "utf8",
});
const output = `${result.stdout}${result.stderr}`.trim();

if (result.status === 0) {
  writeState({ dirty: [], stopBlocks: 0 });
  process.exit(0);
}

state.stopBlocks += 1;
if (state.stopBlocks > MAX_BLOCKS) {
  writeState({ ...state, stopBlocks: 0 });
  console.log(JSON.stringify({
    systemMessage: `[harness] 검증 게이트가 ${MAX_BLOCKS}회 연속 실패해 종료를 허용합니다. 사용자에게 실패 내용을 보고하세요.`,
  }));
  process.exit(0);
}
writeState(state);
console.log(JSON.stringify({
  decision: "block",
  reason: `하네스 검증 게이트 실패 (${state.stopBlocks}/${MAX_BLOCKS}). 원인을 고친 뒤 다시 마무리하세요:\n\n${output}`,
}));
