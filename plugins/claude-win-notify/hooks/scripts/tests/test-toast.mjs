#!/usr/bin/env node
/**
 * 弹窗测试 — 验证 Windows Toast 通知是否能正常弹出。
 * 直接运行即可，无需 Claude Code 环境。
 *
 * 用法:
 *   node hooks/scripts/tests/test-toast.mjs
 *   node hooks/scripts/tests/test-toast.mjs --icon    # 带图标测试
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const ICON_PATH = join(PROJECT_ROOT, 'assets', 'claude.svg');

function escXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function sendToast(title, message, useIcon) {
  const iconXml = useIcon && existsSync(ICON_PATH)
    ? `<image placement="appLogoOverride" src="file:///${ICON_PATH.replace(/\\/g, '/')}" hint-crop="none"/>`
    : '';

  const toastXml = [
    '<toast duration="short">',
    '  <visual><binding template="ToastGeneric">',
    `    <text>${escXml(title)}</text>`,
    `    <text>${escXml(message)}</text>`,
    iconXml,
    '  </binding></visual>',
    '<audio src="ms-winsoundevent:Notification.Default"/>',
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
  try {
    $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('ClaudeCode.Notify')
    if ($notifier.Setting -eq [Windows.UI.Notifications.NotificationSetting]::Enabled) { $notifier.Show($toast); Write-Host 'OK' }
  } catch { Write-Host 'FAILED: toast delivery' }
} catch { Write-Host 'FAILED: WinRT init' }
`;

  const result = spawnSync('powershell.exe',
    ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-Command', psScript],
    { windowsHide: true, timeout: 10_000 });

  const output = result.stdout?.toString().trim() || '';
  const stderr = result.stderr?.toString().trim() || '';
  return { success: output === 'OK', output, stderr, code: result.status };
}

// --- 测试用例 ---
const tests = [
  { name: '基本通知（无图标）', title: '🔔 测试通知', msg: '如果你看到这个弹窗，说明 Toast 机制正常工作', icon: false },
  { name: '中文长文本测试', title: 'Claude Code 通知测试', msg: '这是一条较长的中文测试消息，用于验证文本截断和换行显示是否正常。如果能看到完整内容说明显示正常。', icon: false },
  { name: '特殊字符测试', title: '测试 < & > 转义', msg: '特殊字符: <Hello & World> \'Single\' "Double"', icon: false },
];

const useIcon = process.argv.includes('--icon');
if (useIcon) {
  tests.push({ name: '带图标通知', title: 'Claude Code', msg: '带 SVG 图标的 Toast 通知', icon: true });
}

let passed = 0;
let failed = 0;

console.log(`🧪 Windows Toast 测试 (${tests.length} 项)\n`);

for (const t of tests) {
  process.stdout.write(`  [${t.name}]... `);
  const result = sendToast(t.title, t.msg, t.icon);

  // 等待一下以免 Toast 叠加快
  await new Promise(r => setTimeout(r, 500));

  if (result.success) {
    console.log('✅');
    passed++;
  } else {
    console.log(`❌ (exit=${result.code}, out=${result.output || '—'}, err=${result.stderr || '—'})`);
    failed++;
  }
}

console.log(`\n结果: ${passed} 通过, ${failed} 失败, ${tests.length} 总计`);
process.exit(failed > 0 ? 1 : 0);
