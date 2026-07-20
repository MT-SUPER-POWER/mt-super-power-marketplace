# Handoff: claude-win-notify Plugin

## 项目地址
- GitHub: https://github.com/MT-SUPER-POWER/claude-win-notify
- 本地: `D:\Github\claude-win-notify\`

## 已完成

- [x] 创建仓库并推送到 GitHub
- [x] `.claude-plugin/plugin.json` — 插件元信息
- [x] `hooks/hooks.json` — 三组 hook 事件配置
- [x] `hooks/scripts/notify.mjs` — 核心通知脚本（Node.js，路径已适配 `${CLAUDE_PLUGIN_ROOT}`）
- [x] `hooks/scripts/notify.ps1` — PowerShell 备选方案
- [x] `assets/claude.svg` / `claudecode-color.svg` — 通知图标
- [x] `README.md` — 安装使用说明

## 设计

Hook 事件覆盖：
| 事件 | Matcher | 模式 |
|------|---------|------|
| `PermissionRequest` | Bash\|Edit\|Write\|Agent | `--permission` |
| `PreToolUse` | AskUserQuestion | `--question` |
| `Stop` | (全部) | `--stop` |

路径使用 `${CLAUDE_PLUGIN_ROOT}` 占位符 + exec form（args 数组），避免 shell 转义问题。
`CLAUDE_PLUGIN_ROOT` 也会作为环境变量注入，`notify.mjs` 通过 `process.env.CLAUDE_PLUGIN_ROOT` 读取。

## 待办 / 可改进

- [ ] 本地测试验证：`claude --plugin-dir D:\Github\claude-win-notify`
- [ ] 发布到 Claude Code 社区 marketplace
- [ ] 去掉原 `~/.claude/settings.json` 中的 hooks 配置（启用 plugin 后会冲突）
- [ ] 添加 `claude-focus://` 协议注册脚本（Toast 点击回到 Claude Code）
- [ ] 考虑发布到 npm 便于 `--plugin-url` 方式安装

## 参考文档

- Plugin 教学: https://docs.anthropic.com/en/docs/claude-code/plugins
- Plugin 参考: https://docs.anthropic.com/en/docs/claude-code/plugins-reference
- Hooks 参考: https://docs.anthropic.com/en/docs/claude-code/hooks