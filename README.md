# 前端脚手架 - femaker

rust重构fe-cli, 重命名为 femaker; 

### 特点
- 简单优雅
- 提高前端的研发效能
- 速度快

### 安装
```bash
cargo install femaker

# 注意
# 使用以下命令将 Rust 的二进制目录添加到你的 PATH
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc  # 如果你使用的是 Bash
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc   # 如果你使用的是 Zsh

# 更新当前终端会话中的 PATH：
source ~/.bashrc  # 如果你使用的是 Bash
source ~/.zshrc   # 如果你使用的是 Zsh

# 命令行直接运行
femaker
```

### femaker new <project-name>

项目初始化的标准流程：

```bash
# 初始化 demo 项目
femaker new demo

femaker info v0.1.1
✔ 请选择模版类型 · 项目
✔ 请选择模板 · antd
正在下载模版...
项目初始化完成！

# 先创建远程仓库，然后 本地仓库与远程仓库关联
cd demo
git init
git add .
git commit -m "chore: first commit"
git branch -M main # 主分支重命名为 main
git remote add origin https://github.com/luozyiii/demo.git
git push -u origin main # 强制推送

```

### femaker add 添加模版

将平时喜欢的项目模版添加到 femaker 脚手架(仅支持 git 仓库)

```bash
femaker add

femaker info v0.1.1
✔ 请选择模版类型 · 项目
请填写模版名称: Taro小程序模版
请填写模版git地址: https://github.com/luozyiii/taro-app.git
模板添加成功！
```

### femaker list 查看模版

```bash
femaker list

femaker info v0.1.1
【项目】Taro小程序模板
【组件】小程序表单组件
【项目】pc 项目
```

### femaker deploy 发布(建议只用于发布开发/测试环境)

```bash
# 1、在项目根目录配置deploy.config.json; 标准格式如下
[
  {
    "name": "开发环境",
    "server_address": "81.71.98.176:22",
    "username": "root",
    "password": "***",
    "local_dir": "./test",
    "remote_dir": "/root/rust-test"
  },
  {
    "name": "测试环境",
    "server_address": "81.71.98.176:22",
    "username": "root",
    "password": "***",
    "local_dir": "./test",
    "remote_dir": "/root/rust-test"
  }
]


# 2、在项目根目录执行 femaker deploy
femaker deploy

femaker info v0.1.1
✔ 请选择部署环境 · 测试环境
开始部署...
创建远程目录: "/root/rust-test"
创建远程目录: "/root/rust-test/abc"
上传文件: "/root/rust-test/abc/1.txt"
上传文件: "/root/rust-test/2.txt"
部署成功！
```

## 发布
```bash
# https://crates.io/settings/tokens
# new token
cargo login token

cargo build

cargo doc --no-deps

cargo publish

```

## rust 代码规范

```bash
# 安装 vscode-rustfmt 插件
```

```json
// .vscode/settings.json
{
  "[rust]": {
    "editor.defaultFormatter": "statiolake.vscode-rustfmt",
    "editor.formatOnSave": true,
    "editor.tabSize": 4
  }
}
```

## 资料

- [rust](https://www.rust-lang.org/learn)
- [crates](https://crates.io/)
- [15 分钟创建一个命令行程序](https://rust-cli.github.io/book/tutorial/index.html)
- [rust clap 学习](https://blog.csdn.net/yhb_csdn/article/details/131162434)

## 感谢支持

- [Github](https://github.com/luozyiii/femaker-cli)
