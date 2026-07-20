# MT Super Power Marketplace

Claude Code plugin marketplace by MT.

## 安装 Marketplace

在 Claude Code 中运行：

```bash
/plugin marketplace add MT-SUPER-POWER/mt-super-power-marketplace
```

然后安装插件：

```bash
/plugin install claude-win-notify
```

## 可用插件

| 插件 | 说明 |
|------|------|
| [claude-win-notify](plugins/claude-win-notify/) | Windows 原生 Toast 通知 — 工具审批、提问、任务完成时弹出通知 |

## 发布流程

本仓库遵循 [Claude Code 插件市场规范](https://code.claude.com/docs/zh-CN/plugin-marketplaces)。

目录结构：

```
mt-super-power-marketplace/
├── .claude-plugin/
│   └── marketplace.json    # Marketplace 清单（必需）
├── README.md               # 本文件
└── plugins/                # 插件目录
    └── claude-win-notify/  # 插件包
        ├── .claude-plugin/
        │   └── plugin.json
        ├── hooks/
        │   ├── hooks.json
        │   └── scripts/
        └── assets/
```

更新插件后，修改 `plugin.json` 中的 `version` 并推送到 `main` 分支，用户可通过 `/plugin update` 获取最新版本。

## 许可

各插件许可见其目录下的 LICENSE 文件。
