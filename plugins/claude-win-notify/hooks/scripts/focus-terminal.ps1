param([string]$Uri)

$ErrorActionPreference = "Stop"

Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class NativeWindow {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
}
"@

$terminal = Get-Process -Name WindowsTerminal -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowHandle -ne 0 } |
  Sort-Object StartTime -Descending |
  Select-Object -First 1

if ($null -eq $terminal) { exit 0 }

$window = [IntPtr]$terminal.MainWindowHandle
if ([NativeWindow]::IsIconic($window)) {
  [void][NativeWindow]::ShowWindowAsync($window, 9)
}
[void][NativeWindow]::BringWindowToTop($window)
[void][NativeWindow]::SetForegroundWindow($window)
