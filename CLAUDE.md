# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Claude Code plugin that sends Windows native Toast notifications for key Claude Code events — tool permission requests, questions, and task completion.

## Architecture

```
├── .claude-plugin/plugin.json     # Plugin manifest (name, version, author)
├── hooks/hooks.json               # Maps hook events → script invocations
├── hooks/scripts/notify.mjs       # Primary Node.js notification script
├── hooks/scripts/notify.ps1       # PowerShell fallback
└── assets/                        # Toast icons (claude.svg, claudecode-color.svg)
```

### Hook Events

| Event | Matcher | Flag | Trigger |
|-------|---------|------|---------|
| `PermissionRequest` | `Bash\|Edit\|Write\|Agent` | `--permission` | Tool needs approval |
| `PreToolUse` | `AskUserQuestion` | `--question` | Claude asks the user |
| `Stop` | (all) | `--stop` | Task completes |

### notify.mjs — Core Logic

- **Mode**: Reads `process.argv[2]` (`--permission`, `--question`, `--stop`) to determine event type
- **Stdin**: `PermissionRequest` and `PreToolUse` events pipe JSON event data via stdin
- **Debounce**: `Stop` events are debounced with a 30-second window via `%TEMP%\claude-notify-state.json` — if a permission/question toast was shown recently, the stop toast is suppressed
- **Toast delivery**: Spawns a hidden `powershell.exe` process that calls the WinRT `Windows.UI.Notifications.ToastNotificationManager` API
- **Icon**: Loads `assets/claude.svg` from `CLAUDE_PLUGIN_ROOT` env var

### Path Conventions

- All hooks use `${CLAUDE_PLUGIN_ROOT}` placeholder + exec form (args array) — never shell strings
- The `CLAUDE_PLUGIN_ROOT` environment variable is injected by the Claude Code plugin runtime
- Assets and scripts are always referenced relative to `CLAUDE_PLUGIN_ROOT`

## Installation

### Development / testing (no install)
```bash
claude --plugin-dir D:\Github\claude-win-notify
```

### Production (global install)
```bash
/plugin install D:\Github\claude-win-notify
# or from GitHub
/plugin install https://github.com/MT-SUPER-POWER/claude-win-notify
```

Once installed via `/plugin install`, the plugin loads automatically in every session.

## Development Workflow

### Adding a New Hook Event

1. Add entry in `hooks/hooks.json` with the event name, optional matcher regex, and command args
2. Implement the handler in `hooks/scripts/notify.mjs` — add a new case to the `mode` switch and a handler function
3. Wire the new flag (e.g., `--my-event`) to the handler in the switch statement at the bottom of `notify.mjs`

## Requirements

- Windows 10 1809+ (WinRT toast API)
- Node.js (for notify.mjs)
- PowerShell 5.1+ (for notify.ps1 fallback)
