# claude-win-notify

Windows 原生 Toast 通知 — 实时推送 Claude Code 的关键事件。

当 Claude Code 发生以下事件时，在 Windows 右下角弹出 Toast 通知：
- 请求工具权限（Bash/Edit/Write/Agent）
- 向你提问
- 任务完成

## 安装

### 方式一：使用 claude plugin init（推荐，自动加载）

Claude Code 可以自动加载 skills 目录中的插件，无需手动复制文件：

1. 克隆本仓库到本地任意目录:
   ```bash
   git clone https://github.com/MT-SUPER-POWER/claude-win-notify.git
   cd claude-win-notify
   npm install
   ```
2. 使用 plugin init 创建 skills 目录中的插件:
   ```bash
   claude plugin init claude-win-notify
   ```
   这会创建 `~/.claude/skills/claude-win-notify/` 目录，包含插件清单和 SKILL.md。

3. 将本仓库的内容复制到 skills 目录（覆盖自动生成的文件）:
   ```powershell
   Copy-Item -Path .\* -Destination "$HOME\.claude\skills\claude-win-notify" -Recurse -Force
   ```

4. 启动新会话或运行 `/reload-plugins` 即可自动加载。

### 方式二：本地手动安装（直接复制）

```powershell
# PowerShell 命令行：
New-Item -ItemType Directory -Force -Path "$HOME\.claude\skills"
Copy-Item -Path D:\Github\claude-win-notify -Destination "$HOME\.claude\skills\claude-win-notify" -Recurse -Force
```

启动新会话或运行 `/reload-plugins`。

### 方式三：本地开发测试（临时加载）

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

## 点击通知聚焦终端

首次安装或移动插件后，在 PowerShell 中执行一次：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\hooks\scripts\install-focus-handler.ps1
```

安装脚本会仅为当前 Windows 用户注册 `claude-win-notify://` 协议。之后点击通知横幅或通知中心条目会在后台恢复并聚焦运行中的 Windows Terminal 窗口，不会创建新 tab 或控制台窗口。若同时打开多个独立的 Windows Terminal 窗口，会聚焦最近启动的窗口。
