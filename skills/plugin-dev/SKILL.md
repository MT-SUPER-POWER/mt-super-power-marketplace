---
description: "Use when the user asks about this plugin's architecture, wants to add a new hook event, edit notify.mjs, modify hooks.json, run plugin tests, or debug notification issues."
---

# claude-win-notify 开发指南

## 架构

```
├── .claude-plugin/plugin.json     # 插件清单
├── hooks/hooks.json               # Hook 事件 → 脚本映射
├── hooks/scripts/notify.mjs       # 通知脚本（powertoast）
└── assets/claude.svg              # Toast 图标
```

## Hook 事件

| 事件 | Matcher | 参数 | 触发时机 |
|------|---------|------|---------|
| `PermissionRequest` | `Bash\|Edit\|Write\|Agent` | `--permission` | 工具需要审批 |
| `PreToolUse` | `AskUserQuestion` | `--question` | Claude 向你提问 |
| `Stop` | (全部) | `--stop` | 任务完成 |

## notify.mjs — 核心逻辑

- 使用 powertoast 库，避免原生 PowerShell 的 WinRT 类型加载问题
- 自动检测 Windows Terminal（`where wt.exe`）作为 AUMID，未安装则回退默认
- stdin 接收 JSON 事件数据
- Stop 事件 30 秒防抖，避免冗余通知

## hooks.json 格式

使用 exec form（官方文档格式），`command` 为字符串，`args` 为数组：

```json
{
  "type": "command",
  "command": "node",
  "args": ["${CLAUDE_PLUGIN_ROOT}/hooks/scripts/notify.mjs", "--permission"]
}
```

**禁止**使用数组格式的 `command`，会静默失败。

## 添加新 Hook 事件

1. 在 `hooks/hooks.json` 添加新条目
2. 在 `notify.mjs` 底部 switch 添加新的 flag 分支和处理函数
3. 在 `hooks/scripts/tests/` 添加对应测试

## 运行测试

```bash
node hooks/scripts/tests/test.mjs          # 基础弹窗测试
node hooks/scripts/tests/test-toast.mjs    # Toast 功能测试
node hooks/scripts/tests/test-integration.mjs  # 集成测试
```

## 系统要求

- Windows 10 1809+（WinRT Toast API）
- Node.js
- Windows Terminal（可选，用于品牌化通知来源）
