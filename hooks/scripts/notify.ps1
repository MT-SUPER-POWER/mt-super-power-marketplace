#!/usr/bin/env pwsh

try {
    $json = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($json)) { exit 0 }
    $data = $json | ConvertFrom-Json
} catch {
    exit 0
}

$eventName = $data.hook_event_name
$title = "Claude Code"
$message = ""

switch ($eventName) {
    "PermissionRequest" {
        $tool = $data.tool_name
        $toolInput = $data.tool_input

        switch ($tool) {
            "Bash" {
                $cmd = $toolInput.command
                if (-not $cmd) { $cmd = "(unknown command)" }
                if ($cmd.Length -gt 120) { $cmd = $cmd.Substring(0, 117) + "..." }
                $message = "╰╴执行: $cmd"
            }
            "Edit" {
                $path = $toolInput.file_path
                if (-not $path) { $path = "(unknown file)" }
                $message = "╰╴编辑: $path"
            }
            "Write" {
                $path = $toolInput.file_path
                if (-not $path) { $path = "(unknown file)" }
                $message = "╰╴写入: $path"
            }
            "Agent" {
                $desc = $toolInput.description
                if ($desc) {
                    if ($desc.Length -gt 100) { $desc = $desc.Substring(0, 97) + "..." }
                    $message = "╰╴启动 Agent: $desc"
                } else {
                    $message = "╰╴启动后台 Agent"
                }
            }
            default {
                $message = "╰╴请求使用 $tool"
            }
        }
    }
    "Notification" {
        $msg = $data.message
        if ($msg) {
            if ($msg.Length -gt 140) { $msg = $msg.Substring(0, 137) + "..." }
            $message = $msg
        } else {
            $message = "Claude Code 需要你关注"
        }
    }
    default {
        $message = "Claude Code"
    }
}

if (-not $message) { exit 0 }

try {
    $null = New-BurntToastNotification -Text $title, $message -Sound Default -ErrorAction Stop
    exit 0
} catch {
    try {
        $null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
        $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
        $textNodes = $template.GetElementsByTagName('text')
        $textNodes.Item(0).AppendChild($template.CreateTextNode($title)) | Out-Null
        $textNodes.Item(1).AppendChild($template.CreateTextNode($message)) | Out-Null
        $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($title).Show($toast)
    } catch {
    }
}