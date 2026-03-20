param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ScriptArgs
)

$env:MDH_SD_SITE_PACKAGES = "D:\ai-runtime\sd-site-packages"
$env:HF_HOME = "D:\ai-cache\huggingface"
$env:HUGGINGFACE_HUB_CACHE = "D:\ai-cache\huggingface\hub"
$env:TORCH_HOME = "D:\ai-cache\torch"
$env:PIP_CACHE_DIR = "D:\ai-cache\pip"

New-Item -ItemType Directory -Force $env:HF_HOME | Out-Null
New-Item -ItemType Directory -Force $env:HUGGINGFACE_HUB_CACHE | Out-Null
New-Item -ItemType Directory -Force $env:TORCH_HOME | Out-Null
New-Item -ItemType Directory -Force $env:PIP_CACHE_DIR | Out-Null

python D:\mdh-3d-store\scripts\generate_product_reference_sd.py @ScriptArgs
