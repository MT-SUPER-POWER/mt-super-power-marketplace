#!/usr/bin/env node

import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const STATE_FILE = join(process.env.TEMP || 'C:\\Temp', 'claude-notify-state.json');
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT;
const ICON_PATH = PLUGIN_ROOT ? join(PLUGIN_ROOT, 'assets', 'claude.svg') : '';
const DEBOUNCE_WINDOW = 30_000;

function now() { return Date.now(); }

function escXml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/\r?\n/g, ' ');
}

function clip(str, max = 120) {
  if (!str) return '';
  return str.length <= max ? str : str.slice(0, max - 3) + '...';
}

function readState() {
  try { if (existsSync(STATE_FILE)) return JSON.parse(readFileSync(STATE_FILE, 'utf-8')); }
  catch { /* noop */ }
  return null;
}

function saveState(state)  { try { writeFileSync(STATE_FILE, JSON.stringify(state)); } catch {} }
function clearState()      { try { writeFileSync(STATE_FILE, JSON.stringify(null)); } catch {} }

async function readStdin() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString().trim();
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function sendToast(title, message) {
  const t = escXml(clip(title, 60));
  const m = escXml(clip(message, 140));
  const iconXml = ICON_PATH && existsSync(ICON_PATH)
    ? `<image placement="appLogoOverride" src="file:///${ICON_PATH.replace(/\\/g, '/')}" hint-crop="none"/>`
    : '';
  const toastXml = [
    '<toast duration="short">',
    '  <visual><binding template="ToastGeneric">',
    `    <text>${t}</text><text>${m}</text>`,
    iconXml,
    '  </binding></visual>',
    '  <audio src="ms-winsoundevent:Notification.Default"/>',
    '</toast>',
  ].join('');

  const psScript = `
$ErrorActionPreference = 'SilentlyContinue'
try {
  [void][Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime]
  [void][Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType=WindowsRuntime]
  $xml = [Windows.Data.Xml.Dom.XmlDocument]::new()
  $xml.LoadXml('${toastXml.replace(/'/g, "''")}')
  $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
  $shown = $false
  try {
    $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('')
    if ($notifier.Setting -eq [Windows.UI.Notifications.NotificationSetting]::Enabled) { $notifier.Show($toast); $shown = $true }
  } catch {}
  if (-not $shown) {
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('').Show($toast)
  }
} catch {}
`;
  spawnSync('powershell.exe',
    ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-Command', psScript],
    { windowsHide: true, timeout: 10_000 });
}

function handlePermission(data) {
  const tool  = data?.tool_name;
  const input = data?.tool_input || {};
  let msg = '';
  switch (tool) {
    case 'Bash':  msg = `▶ 执行: ${clip(input.command, 100)}`; break;
    case 'Edit':  msg = `✏ 编辑: ${clip(input.file_path, 100)}`; break;
    case 'Write': msg = `📫 写入: ${clip(input.file_path, 100)}`; break;
    case 'Agent': msg = `🛻 启动 Agent: ${clip(input.description, 100)}`; break;
    default:      msg = `🔡 请求使用: ${tool}`;
  }
  saveState({ type: 'permission', time: now() });
  sendToast('Claude Code 等待批准', msg);
}

function handleQuestion(data) {
  const q = clip(data?.tool_input?.question, 140);
  saveState({ type: 'question', time: now(), question: q });
  sendToast('Claude Code 有问题', q || 'Claude 想问你一些事');
}

async function handleStop() {
  const state   = readState();
  const elapsed = state ? now() - state.time : Infinity;
  if (state && elapsed < DEBOUNCE_WINDOW) { clearState(); return; }
  clearState();
  sendToast('Claude Code 完成', '✅ 任务完成，等待你的指示');
}

const mode = process.argv[2];
switch (mode) {
  case '--permission': { const d = await readStdin(); handlePermission(d); break; }
  case '--question':   { const d = await readStdin(); handleQuestion(d);   break; }
  case '--stop':       { await handleStop(); break; }
  default:             { const d = await readStdin(); console.error(JSON.stringify(d, null, 2)); }
}