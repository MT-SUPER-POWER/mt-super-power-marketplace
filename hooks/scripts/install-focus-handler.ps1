[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$focusScript = Join-Path $PSScriptRoot "focus-terminal.ps1"
$launcherScript = Join-Path $PSScriptRoot "focus-terminal.vbs"
if (-not (Test-Path -LiteralPath $focusScript) -or -not (Test-Path -LiteralPath $launcherScript)) {
  throw "Focus handler files were not found in: $PSScriptRoot"
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
