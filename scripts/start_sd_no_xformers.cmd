@echo off
set PYTHON=C:\Users\markm\AppData\Local\Programs\Python\Python310\python.exe
set GIT=
set VENV_DIR=D:\sd-webui-venv
set TMP=D:\sd-temp
set TEMP=D:\sd-temp
set PIP_CACHE_DIR=D:\sd-pip-cache
set STABLE_DIFFUSION_REPO=https://github.com/w-e-w/stablediffusion.git
set STABLE_DIFFUSION_COMMIT_HASH=cf1d67a6fd5ea1aa600c4df58e5b47da45f6bdbf
set COMMANDLINE_ARGS=--no-download-sd-model --opt-sdp-no-mem-attention --no-half-vae --medvram-sdxl --api --port 7861 --ckpt-dir "D:/sd-models/Stable-diffusion" --ckpt "D:/sd-models/Stable-diffusion/juggernautXL_ragnarokBy.safetensors"
cd /d D:\pinokio\api\sd-webui.pinokio.git\automatic1111
call D:\pinokio\api\sd-webui.pinokio.git\automatic1111\webui.bat
