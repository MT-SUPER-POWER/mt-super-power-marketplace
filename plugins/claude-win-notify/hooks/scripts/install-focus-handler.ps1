[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

# 优先使用 CLAUDE_PLUGIN_ROOT 环境变量（Claude 插件系统会注入）
# 这样无论插件安装在哪里，路径都是正确的
$pluginRoot = $env:CLAUDE_PLUGIN_ROOT

if ($pluginRoot -and (Test-Path -LiteralPath $pluginRoot)) {
    # 使用 CLAUDE_PLUGIN_ROOT 构建路径
    $focusScript = Join-Path $pluginRoot "hooks\scripts\focus-terminal.ps1"
    $launcherScript = Join-Path $pluginRoot "hooks\scripts\focus-terminal.vbs"
} else {
    # 回退到脚本所在目录（开发环境或本地测试时使用）
    $scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path $MyInvocation.MyCommand.Path -Parent }
    $focusScript = Join-Path $scriptDir "focus-terminal.ps1"
    $launcherScript = Join-Path $scriptDir "focus-terminal.vbs"
}
if (-not (Test-Path -LiteralPath $focusScript) -or -not (Test-Path -LiteralPath $launcherScript)) {
  $searchPath = if ($pluginRoot) { $pluginRoot } else { $scriptDir }
  throw "Focus handler files were not found in: $searchPath"
}

$protocolKey = "HKCU\Software\Classes\claude-win-notify"
$commandKey = "$protocolKey\shell\open\command"
$wscript = Join-Path $env:WINDIR "System32\wscript.exe"
$command = "`"$wscript`" `"$launcherScript`" `"%1`""

New-Item -Path "Registry::$protocolKey" -Force | Out-Null
Set-Item -Path "Registry::$protocolKey" -Value "URL:Claude Code notification focus handler"
New-ItemProperty -Path "Registry::$protocolKey" -Name "URL Protocol" -PropertyType String -Value "" -Force | Out-Null
New-Item -Path "Registry::$commandKey" -Force | Out-Null
Set-Item -Path "Registry::$commandKey" -Value $command

Write-Output "Installed the Claude Code notification focus handler for the current user."
