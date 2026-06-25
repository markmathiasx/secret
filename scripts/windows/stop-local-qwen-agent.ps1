Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Where-Object { $_.CommandLine -like "*local-agent*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
