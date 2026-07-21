# MT Super Power Marketplace

Claude Code plugin marketplace by MT-SUPER-POWER.

## 安装 Marketplace

在 Claude Code 中运行：

```bash
/plugin marketplace add MT-SUPER-POWER/mt-super-power-marketplace
```

然后安装插件：

```bash
/plugin install claude-win-notify
/plugin install git-conventions
```

## 可用插件

| 插件                                            | 说明                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| [claude-win-notify](plugins/claude-win-notify/) | Windows 原生 Toast 通知 — 工具审批、提问、任务完成时弹出通知，支持点击聚焦终端 |
| [git-conventions](plugins/git-conventions/)     | Enforce Conventional Commits with structured body, pre-commit checks, and safe git defaults |

## 发布流程

本仓库遵循 [Claude Code 插件市场规范](https://code.claude.com/docs/zh-CN/plugin-marketplaces)。

目录结构：

```
mt-super-power-marketplace/
├── .claude-plugin/
│   └── marketplace.json    # Marketplace 清单（必需）
├── README.md               # 本文件
└── plugins/                # 插件目录
    ├── claude-win-notify/  # Windows Toast 通知
    │   ├── .claude-plugin/
    │   │   └── plugin.json
    │   ├── hooks/
    │   │   ├── hooks.json
    │   │   └── scripts/
    │   │       ├── notify.mjs
    │   │       ├── focus-terminal.vbs
    │   │       └── install-focus-handler.ps1
    │   └── assets/
    └── git-conventions/    # Git 提交准则
        ├── .claude-plugin/
        │   └── plugin.json
        ├── skills/
        │   └── SKILL.md
        └── README.md
```

### 更新插件

1. 修改 `plugins/claude-win-notify/.claude-plugin/plugin.json` 中的 `version`
2. 推送到 `main` 分支
3. 用户执行 `/plugin update` 获取最新版本

### 验证 Marketplace

```bash
claude plugin validate .
```

## 许可

[LICENSE](./LICENSE)。
