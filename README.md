# claude-win-notify

Windows 原生 Toast 通知 — 实时推送 Claude Code 的关键事件。

当 Claude Code 发生以下事件时，在 Windows 右下角弹出 Toast 通知：
- 请求工具权限（Bash/Edit/Write/Agent）
- 向你提问
- 任务完成

## 安装

### 全局安装（推荐）
```bash
/plugin install https://github.com/MT-SUPER-POWER/claude-win-notify
```

### 本地开发测试
```bash
claude --plugin-dir D:\Github\claude-win-notify
```

## 系统要求

- Windows 10 1809+（使用内置 WinRT Toast API）
- Node.js（运行 notify.mjs）
- PowerShell 5.1+（notify.ps1 回退方案）

## 项目结构

```
├── .claude-plugin/plugin.json     # 插件清单
├── hooks/hooks.json                # Hook 事件配置
├── hooks/scripts/notify.mjs        # Node.js 通知脚本（核心）
├── hooks/scripts/notify.ps1        # PowerShell 备选脚本
└── assets/claude.svg               # Toast 图标
```

## Hook 事件

| 事件 | 匹配器 | 触发时机 |
|------|--------|---------|
| `PermissionRequest` | `Bash\|Edit\|Write\|Agent` | 工具需要审批 |
| `PreToolUse` | `AskUserQuestion` | Claude 向你提问 |
| `Stop` | (全部) | 任务完成 |

## 工作原理

1. Claude Code 触发 hook 事件时，执行 `hooks/scripts/notify.mjs`
2. 脚本通过 WinRT API（`Windows.UI.Notifications.ToastNotificationManager`）弹出系统 Toast
3. Stop 事件带有 30 秒防抖：如果刚显示过权限/提问通知，则跳过完成通知，避免冗余

## 许可

MIT
