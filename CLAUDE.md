# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Claude Code plugin that sends Windows native Toast notifications for key Claude Code events — tool permission requests, questions, and task completion.

## Architecture

```
├── .claude-plugin/plugin.json     # Plugin manifest
├── hooks/hooks.json               # Hook event → script mapping
├── hooks/scripts/notify.mjs       # Notification script (powertoast)
└── assets/claude.svg              # Toast icon
```

### Hook Events

| Event | Matcher | Flag | Trigger |
|-------|---------|------|---------|
| `PermissionRequest` | `Bash\|Edit\|Write\|Agent` | `--permission` | Tool needs approval |
| `PreToolUse` | `AskUserQuestion` | `--question` | Claude asks the user |
| `Stop` | (all) | `--stop` | Task completes |

### notify.mjs — Core Logic

- **powertoast**: Uses [powertoast](https://github.com/xan105/node-powertoast) npm package instead of raw PowerShell, which handles WinRT API loading and AUMID issues
- **AUMID**: Auto-detects Windows Terminal via `where wt.exe` (WindowsApps is protected, `existsSync` doesn't work), falls back to undefined if not installed
- **Stdin**: `PermissionRequest` and `PreToolUse` events pipe JSON via stdin
- **Debounce**: Stop events are debounced 30s via `%TEMP%\claude-notify-state.json`
- **Event type**: Reads `process.argv[2]` (`--permission`, `--question`, `--stop`)

### hooks.json Format

Use exec form (documented format) — `command` is a string, `args` is an array:

```json
{
  "type": "command",
  "command": "node",
  "args": ["${CLAUDE_PLUGIN_ROOT}/hooks/scripts/notify.mjs", "--permission"]
}
```

**Do NOT** use array format for `command` — `"command": ["node", "..."]` is invalid and will silently fail.

## Installation

### Development / testing
```bash
claude --plugin-dir D:\Github\claude-win-notify
```

### Community marketplace (after submission)
```bash
/plugin marketplace add anthropics/claude-plugins-community
/plugin install claude-win-notify
```

Validate before submitting:
```bash
claude plugin validate D:\Github\claude-win-notify
```

## Development Workflow

### Adding a New Hook Event

1. Add entry in `hooks/hooks.json` with the event name, optional matcher regex, and exec-form command/args
2. Add handler in `notify.mjs` — add a case to the `mode` switch at the bottom
3. Test with the appropriate test script in `hooks/scripts/tests/`

### Running Tests
```bash
node hooks/scripts/tests/test.mjs          # Basic toast test
node hooks/scripts/tests/test-toast.mjs    # Toast feature tests
node hooks/scripts/tests/test-integration.mjs  # Integration tests
```

## Requirements

- Windows 10 1809+ (WinRT toast API)
- Node.js
- Windows Terminal (optional — for branded notification source)
