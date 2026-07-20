#!/usr/bin/env node
/**
 * 集成测试 — 模拟 hook 事件调用 notify.mjs，验证完整链路是否正常。
 * 测试 --permission、--question、--stop 三种模式。
 */
import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(__dirname, '..', 'notify.mjs');
const projectRoot = join(__dirname, '..', '..', '..');

function run(mode, stdinData) {
  const args = [scriptPath, mode];
  const opts = {
    cwd: projectRoot,
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: projectRoot },
    timeout: 15_000,
    windowsHide: true,
  };

  if (stdinData) {
    opts.input = JSON.stringify(stdinData);
  }

  const result = spawnSync('node', args, opts);

  return {
    mode,
    exitCode: result.status,
    stdout: result.stdout?.toString().trim() || '',
    stderr: result.stderr?.toString().trim() || '',
    error: result.error?.message || null,
  };
}

const tests = [
  {
    name: 'PermissionRequest (Bash)',
    fn: () => run('--permission', { tool_name: 'Bash', tool_input: { command: 'ls -la' } }),
  },
  {
    name: 'PermissionRequest (Edit)',
    fn: () => run('--permission', { tool_name: 'Edit', tool_input: { file_path: '/test/file.txt' } }),
  },
  {
    name: 'PermissionRequest (Write)',
    fn: () => run('--permission', { tool_name: 'Write', tool_input: { file_path: '/test/output.txt' } }),
  },
  {
    name: 'PermissionRequest (Agent)',
    fn: () => run('--permission', { tool_name: 'Agent', tool_input: { description: 'search code for bugs' } }),
  },
  {
    name: 'AskUserQuestion',
    fn: () => run('--question', { tool_name: 'AskUserQuestion', tool_input: { question: '你确定要删除这个文件吗？' } }),
  },
  {
    name: 'Stop',
    fn: () => run('--stop'),
  },
  {
    name: 'PermissionRequest (无数据)',
    fn: () => run('--permission', null),
  },
];

let passed = 0;
let failed = 0;

console.log(`🔬 notify.mjs 集成测试 (${tests.length} 项)`);
console.log(`脚本路径: ${scriptPath}\n`);

for (const t of tests) {
  process.stdout.write(`  [${t.name}]... `);
  const result = t.fn();

  if (result.error) {
    console.log(`💥 异常: ${result.error}`);
    failed++;
    continue;
  }

  // 成功 = 脚本没崩溃（exit 0），stderr 无异常内容
  // 注意: 脚本正常执行时 stdout/stderr 都是空的，因为它只弹 Toast 不写控制台
  const hasError = result.stderr && (
    result.stderr.includes('SyntaxError') ||
    result.stderr.includes('Error:') ||
    result.stderr.includes('ERR_')
  );

  if (result.exitCode === 0 && !hasError) {
    console.log(`✅ (exit=0)`);
    passed++;
  } else {
    console.log(`❌ exit=${result.exitCode}, err=${result.stderr || '(empty)'}`);
    failed++;
  }
}

console.log(`\n结果: ${passed} 通过, ${failed} 失败, ${tests.length} 总计`);
process.exit(failed > 0 ? 1 : 0);
