# claude-win-notify

Windows 原生 Toast 通知 — 实时推送 Claude Code 的关键事件。

当 Claude Code 发生以下事件时，在 Windows 右下角弹出 Toast 通知：
- 请求工具权限（Bash/Edit/Write/Agent）
- 向你提问
- 任务完成

## 安装

### 方式一：通过 Marketplace 安装（推荐）

```bash
/plugin marketplace add MT-SUPER-POWER/mt-super-power-marketplace
/plugin install claude-win-notify
```

### 方式二：本地开发测试

```bash
claude --plugin-dir D:\Github\claude-win-notify\plugins\claude-win-notify
```

### 点击聚焦功能（自动配置）

首次显示通知时，插件会自动在 `%LOCALAPPDATA%\claude-win-notify` 安装稳定的启动器，并为当前用户注册 `claude-win-notify://` 协议。点击通知横幅即可在后台恢复并聚焦运行中的 Windows Terminal 窗口，不会创建新 tab 或控制台窗口。

插件升级、重装或 Marketplace 缓存目录变化时，通知脚本会自动校验并修复协议处理器，因此注册表不会指向易变的插件目录。

若系统策略阻止自动注册，可在插件目录中手动执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\hooks\scripts\install-focus-handler.ps1
```

## 系统要求

- Windows 10 1809+（使用内置 WinRT Toast API）
- Node.js（运行通知脚本）
- Windows Terminal（通知来源显示，非必须但推荐）

## 项目结构

```
├── .claude-plugin/plugin.json          # 插件清单
├── hooks/hooks.json                    # Hook 事件配置
├── hooks/scripts/notify.mjs            # 通知脚本（核心，使用 powertoast）
├── hooks/scripts/focus-terminal.vbs    # 点击通知聚焦终端
├── hooks/scripts/install-focus-handler.ps1  # 注册聚焦协议处理器
└── assets/claude.svg                   # Toast 图标
```

## Hook 事件

| 事件 | 匹配器 | Flag | 触发时机 |
|------|--------|------|---------|
| `PermissionRequest` | `Bash\|Edit\|Write\|Agent` | `--permission` | 工具需要审批 |
| `PreToolUse` | `AskUserQuestion` | `--question` | Claude 向你提问 |
| `Stop` | (全部) | `--stop` | 任务完成 |

## 工作原理

1. Claude Code 触发 hook 事件时，执行 `hooks/scripts/notify.mjs`
2. 脚本通过 [powertoast](https://github.com/xan105/node-powertoast) 调用 WinRT Toast API 弹出系统通知
3. 检测是否安装了 Windows Terminal，有则使用其 AUMID（通知来源显示为 "Windows Terminal"）
4. Stop 事件带有 30 秒防抖：如果刚显示过权限/提问通知，则跳过完成通知，避免冗余
5. 若已安装聚焦处理器，点击通知可聚焦 Windows Terminal 窗口

## 开发

### 运行测试

```bash
npm test                      # 基础弹窗测试
npm run test:toast            # Toast 功能测试
npm run test:integration      # 集成测试
npm run test:activation       # 点击聚焦测试
```

### 添加新 Hook 事件

1. 在 `hooks/hooks.json` 中添加事件条目
2. 在 `notify.mjs` 中添加处理逻辑
3. 编写对应测试脚本

## 许可

[MIT License](LICENSE)
