Option Explicit

Dim shell, fileSystem, scriptDirectory, powershell, command
Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")
scriptDirectory = fileSystem.GetParentFolderName(WScript.ScriptFullName)
powershell = shell.ExpandEnvironmentStrings("%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe")
command = """" & powershell & """ -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File """ & scriptDirectory & "\focus-terminal.ps1"""
shell.Run command, 0, False
