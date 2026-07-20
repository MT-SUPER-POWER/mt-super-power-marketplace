# claude-win-notify

Windows 原生 Toast 通知 — 实时推送 Claude Code 的关键事件。

当 Claude Code 发生以下事件时，在 Windows 右下角弹出 Toast 通知：
- 请求工具权限（Bash/Edit/Write/Agent）
- 向你提问
- 任务完成

## 安装

### 方式一：本地手动安装（推荐，当前未发布到 Marketplace 时使用）

1. 克隆本仓库到本地任意目录（例如 `D:\Github\claude-win-notify`）:
   ```bash
   git clone https://github.com/MT-SUPER-POWER/claude-win-notify.git
   ```
2. 进入目录并安装 npm 依赖:
   ```bash
   cd claude-win-notify
   npm install
   ```
3. 创建全局技能目录并将整个插件文件夹拷贝进去 (Windows 环境):
   ```powershell
   # PowerShell 命令行示例：
   New-Item -ItemType Directory -Force -Path "$HOME\.claude\skills"
   Copy-Item -Path . -Destination "$HOME\.claude\skills\claude-win-notify" -Recurse -Force
   ```
4. 启动 Claude Code 或在现有会话中运行以下命令重新加载插件:
   ```bash
   /reload-plugins
   ```

### 方式二：通过 Marketplace 安装（需先添加 Marketplace）

如果你已将本仓库或包含本插件的仓库添加为 Marketplace，可以通过以下命令安装：
```bash
/plugin install claude-win-notify@<marketplace-name>
```

### 方式三：本地开发测试

在启动 Claude Code 时，通过 `--plugin-dir` 临时加载本插件进行测试：
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
