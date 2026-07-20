import { Toast } from "powertoast";
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = process.env.CLAUDE_PLUGIN_ROOT || join(__dirname, "..", "..");
const STATE_FILE = join(process.env.TEMP || "C:\\Temp", "claude-notify-state.json");
const DEBOUNCE_WINDOW = 30_000;
const ICON_PATH = join(PROJECT_ROOT, "assets", "claude.svg");

let _aumid;
function getAumid() {
  if (_aumid !== undefined) return _aumid;
  try {
    const r = spawnSync("where", ["wt.exe"], { windowsHide: true, timeout: 3000 });
    _aumid = r.status === 0
      ? "Microsoft.WindowsTerminal_8wekyb3d8bbwe!App"
      : undefined;
  } catch { _aumid = undefined; }
  return _aumid;
}

function now() { return Date.now(); }

function readState() {
  try { if (existsSync(STATE_FILE)) return JSON.parse(readFileSync(STATE_FILE, "utf-8")); }
  catch { return null; }
}
function saveState(state) { try { writeFileSync(STATE_FILE, JSON.stringify(state)); } catch {} }
function clearState()     { try { writeFileSync(STATE_FILE, JSON.stringify(null)); } catch {} }

async function readStdin() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString().trim();
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clip(str, max = 120) {
  if (!str) return "";
  return str.length <= max ? str : str.slice(0, max - 3) + "...";
}

/**
 * 发送 Toast 通知 + 返回 terminalSequence 给 Claude Code
 * terminalSequence 通过终端 OSC 9 发送，在 Windows Terminal 上触发系统通知
 */
async function sendToast(title, message) {
  const icon = existsSync(ICON_PATH) ? ICON_PATH : "";
  const toast = new Toast({
    title: clip(title, 60),
    message: clip(message, 140),
    icon,
    aumid: getAumid(),
    silent: false,
  });
  try { await toast.show(); } catch {}

  // 返回 terminalSequence：OSC 9 在 Windows Terminal 触发系统通知，点击可聚焦
  const t = clip(title, 60);
  const m = clip(message, 140);
  const seq = `\x1b]9;${t};${m}\x07`;
  process.stdout.write(JSON.stringify({ terminalSequence: seq }));
}

async function handlePermission(data) {
  const tool  = data?.tool_name;
  const input = data?.tool_input || {};
  let msg = "";
  switch (tool) {
    case "Bash":  msg = `执行: ${clip(input.command, 100)}`; break;
    case "Edit":  msg = `编辑: ${clip(input.file_path, 100)}`; break;
    case "Write": msg = `写入: ${clip(input.file_path, 100)}`; break;
    case "Agent": msg = `启动 Agent: ${clip(input.description, 100)}`; break;
    default:      msg = `请求使用: ${tool}`;
  }
  saveState({ type: "permission", time: now() });
  await sendToast("Claude Code 等待批准", msg);
}

async function handleQuestion(data) {
  const q = clip(data?.tool_input?.question, 140);
  saveState({ type: "question", time: now(), question: q });
  await sendToast("Claude Code 有问题", q || "Claude 想问你一些事");
}

async function handleStop() {
  const state   = readState();
  const elapsed = state ? now() - state.time : Infinity;
  if (state && elapsed < DEBOUNCE_WINDOW) { clearState(); return; }
  clearState();
  await sendToast("Claude Code 完成", "任务完成，等待你的指示");
}

const mode = process.argv[2];
switch (mode) {
  case "--permission": { const d = await readStdin(); await handlePermission(d); break; }
  case "--question":   { const d = await readStdin(); await handleQuestion(d);   break; }
  case "--stop":       { await handleStop(); break; }
  default:             { const d = await readStdin(); console.error(JSON.stringify(d, null, 2)); }
}
