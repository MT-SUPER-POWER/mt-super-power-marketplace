# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

A Codex plugin that sends Windows native Toast notifications for key Codex events — tool permission requests, questions, and task completion.

## Architecture

```
├── .Codex-plugin/plugin.json          # Plugin manifest
├── hooks/hooks.json                    # Hook event → script mapping
├── hooks/scripts/notify.mjs            # Notification script (powertoast)
├── hooks/scripts/focus-terminal.vbs    # VBScript to focus Windows Terminal
├── hooks/scripts/install-focus-handler.ps1  # One-time protocol handler installer
└── assets/Codex.svg                   # Toast icon
```

### Hook Events

| Event | Matcher | Flag | Trigger |
|-------|---------|------|---------|
| `PermissionRequest` | `Bash\|Edit\|Write\|Agent` | `--permission` | Tool needs approval |
| `PreToolUse` | `AskUserQuestion` | `--question` | Codex asks the user |
| `Stop` | (all) | `--stop` | Task completes |

### notify.mjs — Core Logic

- **powertoast**: Uses [powertoast](https://github.com/xan105/node-powertoast) npm package instead of raw PowerShell, which handles WinRT API loading and AUMID issues
- **AUMID**: Auto-detects Windows Terminal via `where wt.exe` (WindowsApps is protected, `existsSync` doesn't work), falls back to undefined if not installed
- **Stdin**: `PermissionRequest` and `PreToolUse` events pipe JSON via stdin
- **Debounce**: Stop events are debounced 30s via `%TEMP%\Codex-notify-state.json`
- **Event type**: Reads `process.argv[2]` (`--permission`, `--question`, `--stop`)
- **Click-to-focus**: If a `claude-win-notify://` protocol handler is registered, toasts include `activation: { type: "protocol", launch: "claude-win-notify://focus" }` — clicking the notification runs `focus-terminal.vbs` to bring the most recent Windows Terminal window to the foreground (no new tabs/windows)

### Focus Handler

- `install-focus-handler.ps1` — one-time script that registers `claude-win-notify://` protocol in `HKCU\Software\Classes`
- `focus-terminal.vbs` — VBScript using COM to find and activate the most recent Windows Terminal window
- `notify.mjs` detects the handler via `hasFocusHandler()` (registry check); focus activation is only added when the handler is present

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
Codex --plugin-dir D:\Github\Codex-win-notify
```

### Community marketplace (after submission)
```bash
/plugin marketplace add anthropics/Codex-plugins-community
/plugin install Codex-win-notify
```

Validate before submitting:
```bash
Codex plugin validate D:\Github\Codex-win-notify
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
node hooks/scripts/tests/test-activation.mjs   # Click-to-focus activation tests
```

## Requirements

- Windows 10 1809+ (WinRT toast API)
- Node.js
- Windows Terminal (optional — for branded notification source)
