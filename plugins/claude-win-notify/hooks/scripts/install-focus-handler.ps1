[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

# CLAUDE_PLUGIN_ROOT locates distributed source files; the protocol uses a stable path.
$pluginRoot = $env:CLAUDE_PLUGIN_ROOT

if ($pluginRoot -and (Test-Path -LiteralPath $pluginRoot)) {
    # Resolve source files from the active plugin installation.
    $focusScript = Join-Path $pluginRoot "hooks\scripts\focus-terminal.ps1"
    $launcherScript = Join-Path $pluginRoot "hooks\scripts\focus-terminal.vbs"
} else {
    # Fall back to this script's directory for development and manual repair.
    $scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path $MyInvocation.MyCommand.Path -Parent }
    $focusScript = Join-Path $scriptDir "focus-terminal.ps1"
    $launcherScript = Join-Path $scriptDir "focus-terminal.vbs"
}
if (-not (Test-Path -LiteralPath $focusScript) -or -not (Test-Path -LiteralPath $launcherScript)) {
  $searchPath = if ($pluginRoot) { $pluginRoot } else { $scriptDir }
  throw "Focus handler files were not found in: $searchPath"
}

$localAppData = [Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData)
if (-not $localAppData) {
  throw "LocalApplicationData could not be resolved for the current user."
}

# Plugin cache directories change after upgrades or reinstalls, so keep the launcher stable.
$handlerDir = Join-Path $localAppData "claude-win-notify"
New-Item -ItemType Directory -Path $handlerDir -Force | Out-Null
$installedFocusScript = Join-Path $handlerDir "focus-terminal.ps1"
$installedLauncherScript = Join-Path $handlerDir "focus-terminal.vbs"
Copy-Item -LiteralPath $focusScript -Destination $installedFocusScript -Force
Copy-Item -LiteralPath $launcherScript -Destination $installedLauncherScript -Force

$protocolKey = "HKCU\Software\Classes\claude-win-notify"
$commandKey = "$protocolKey\shell\open\command"
$systemDirectory = [Environment]::GetFolderPath([Environment+SpecialFolder]::System)
$wscript = Join-Path $systemDirectory "wscript.exe"
$command = "`"$wscript`" `"$installedLauncherScript`" `"%1`""

New-Item -Path "Registry::$protocolKey" -Force | Out-Null
Set-Item -Path "Registry::$protocolKey" -Value "URL:Claude Code notification focus handler"
New-ItemProperty -Path "Registry::$protocolKey" -Name "URL Protocol" -PropertyType String -Value "" -Force | Out-Null
New-Item -Path "Registry::$commandKey" -Force | Out-Null
Set-Item -Path "Registry::$commandKey" -Value $command

Write-Output "Installed the Claude Code notification focus handler for the current user: $handlerDir"
