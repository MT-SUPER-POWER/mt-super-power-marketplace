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
- Node.js（运行通知脚本）
- Windows Terminal（通知来源显示，非必须但推荐）

## 项目结构

```
├── .claude-plugin/plugin.json     # 插件清单
├── hooks/hooks.json               # Hook 事件配置
├── hooks/scripts/notify.mjs       # 通知脚本（核心，使用 powertoast）
└── assets/claude.svg              # Toast 图标
```

## Hook 事件

| 事件 | 匹配器 | 触发时机 |
|------|--------|---------|
| `PermissionRequest` | `Bash\|Edit\|Write\|Agent` | 工具需要审批 |
| `PreToolUse` | `AskUserQuestion` | Claude 向你提问 |
| `Stop` | (全部) | 任务完成 |

## 工作原理

1. Claude Code 触发 hook 事件时，执行 `hooks/scripts/notify.mjs`
2. 脚本通过 [powertoast](https://github.com/xan105/node-powertoast) 调用 WinRT Toast API 弹出系统通知
3. 检测是否安装了 Windows Terminal，有则使用其 AUMID（通知来源显示为 "Windows Terminal"）
4. Stop 事件带有 30 秒防抖：如果刚显示过权限/提问通知，则跳过完成通知，避免冗余

## 开发

### 运行测试
```bash
node hooks/scripts/tests/test.mjs          # 基础弹窗测试
node hooks/scripts/tests/test-toast.mjs    # Toast 功能测试
node hooks/scripts/tests/test-integration.mjs  # 集成测试
```

## 许可

[MIT License](LICENSE)
