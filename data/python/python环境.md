windows切换本地python版本:

pip install pyenv-win

环境变量添加进path中:
C:\Users\Administrator\.pyenv\pyenv-win\bin
C:\Users\Administrator\.pyenv\pyenv-win\shims


# 3. 查看可安装的 Python 版本
pyenv install --list

# 4. 安装指定版本
pyenv install 3.8.10

# 5. 查看已安装版本
pyenv versions

# 6. 切换全局版本
pyenv global 3.8.10

# 7. 切换当前目录版本
pyenv local 3.8.10


nvidia-smi
nvcc --version
# python版本

.conda 推荐
1.https://www.anaconda.com/download 下载anaconda
2.添加环境路径

C:\ProgramData\anaconda3
C:\ProgramData\anaconda3\Scripts
C:\ProgramData\anaconda3\Library\bin
C:\ProgramData\anaconda3\Library\mingw-w64\bin
C:\ProgramData\anaconda3\Library\usr\bin

3.验证conda --version
4.conda create -n 环境名称 python=3.9 创建
5.conda activate 环境名称 激活
5.conda deactivate 返回默认版本
6.conda info --envs 获取安装或的版本

pip list:列出安装的包
pip freeze:放入requirements.txt
python -m venv venv
激活虚拟环境，执行 .\venv\scripts\activate

python -m pip install --upgrade pip
pip config set global.index-url https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple


退出环境：deactivate
pip install -r requirements.txt


# 使用pip 安装 插件,使用镜像源就不能用vpn了

pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

下载时有个大的文件叫torch-2.5.1+cu121-cp310-cp310-win_amd64.whl,通过迅雷下载,然后通过pip install torch-2.5.1+cu121-cp310-cp310-win_amd64.whl 这个应该只适合windows本地