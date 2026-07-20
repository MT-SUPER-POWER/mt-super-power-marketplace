# claude-win-notify

Windows native Toast notifications for Claude Code events.

Shows a Windows toast when Claude Code:
- Requests tool permission (Bash/Edit/Write/Agent)
- Asks a question
- Completes a task

## Installation

### Local test
```bash
claude --plugin-dir ./claude-win-notify
```

### Global install (from marketplace)
```bash
/plugin install claude-win-notify
```

### From source
```bash
git clone https://github.com/MT-SUPER-POWER/claude-win-notify.git
claude --plugin-dir ./claude-win-notify
```

## Requirements
- Windows 10 1809+ (built-in WinRT toast API)
- Node.js (for notify.mjs)
- PowerShell 5.1+ (for notify.ps1 fallback)

## Files
```
├── .claude-plugin/plugin.json     # Plugin manifest
├── hooks/hooks.json                # Hook event wiring
├── hooks/scripts/notify.mjs        # Node.js notification script
├── hooks/scripts/notify.ps1        # PowerShell notification script
└── assets/claude.svg               # Toast icon
```