# FeMaker - 前端脚手架工具

[![Crates.io](https://img.shields.io/crates/v/femaker.svg)](https://crates.io/crates/femaker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

FeMaker 是一个使用 Rust 开发的现代化前端脚手架工具，专为提升前端开发效率而设计。它提供了项目模板管理、快速项目初始化和自动化部署等功能。

## ✨ 特性

- 🚀 **高性能**: 基于 Rust 开发，启动速度快，运行效率高
- 🎯 **简单易用**: 交互式命令行界面，操作直观便捷
- 📦 **模板管理**: 支持项目、组件、工具库等多种类型模板
- 🔄 **动态模板**: 从远程服务器获取最新模板列表
- 🚀 **一键部署**: 支持多环境配置的自动化部署
- 🛠️ **可扩展**: 支持自定义模板添加

## 📦 安装

### 通过 Cargo 安装（推荐）

```bash
cargo install femaker
```

### 环境配置

安装完成后，确保 Rust 的二进制目录在你的 PATH 中：

```bash
# Bash 用户
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Zsh 用户
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证安装
femaker --version
```

## 🚀 快速开始

### 创建新项目

使用 `femaker new` 命令快速创建新项目：

```bash
femaker new my-project
```

执行后会出现交互式选择界面：

```
femaker v0.1.2
✔ 请选择模版类型 · 项目
✔ 请选择模板 · vite-antd-pc 管理后台
正在下载模版...
项目初始化完成！
```

### 项目初始化完整流程

```bash
# 1. 创建项目
femaker new my-project

# 2. 进入项目目录
cd my-project

# 3. 初始化 Git 仓库（可选）
git init
git add .
git commit -m "feat: initial commit"

# 4. 关联远程仓库（可选）
git branch -M main
git remote add origin https://github.com/username/my-project.git
git push -u origin main
```

## 📋 命令详解

### `femaker new <project-name>`

创建新项目，支持多种模板类型：
- **项目模板**: 完整的前端项目脚手架
- **组件模板**: 可复用的组件库模板
- **工具模板**: 工具函数库等其他类型模板

### `femaker list`

查看所有可用的模板列表：

```bash
femaker list

# 输出示例：
【项目】vite-antd-pc 管理后台
【项目】next-antd-pc 管理后台
【项目】vite h5 基建项目模板
【组件】react 组件库
【其他】css 库
【其他】基于rollup + typescript 封装常用的工具函数
```

### `femaker add`

添加自定义模板到脚手架（仅支持 Git 仓库）：

```bash
femaker add

# 交互式添加流程：
✔ 请选择模版类型 · 项目
请填写模版名称: 我的自定义模板
请填写模版git地址: https://github.com/username/my-template.git
模板添加成功！
```

### `femaker deploy`

自动化部署功能，支持多环境配置（建议仅用于开发/测试环境）。

#### 配置部署环境

在项目根目录创建 `deploy.config.json` 文件：

```json
[
  {
    "name": "开发环境",
    "server_address": "your-server:22",
    "username": "your-username",
    "password": "your-password",
    "local_dir": "./dist",
    "remote_dir": "/var/www/html"
  },
  {
    "name": "测试环境",
    "server_address": "test-server:22",
    "username": "your-username",
    "password": "your-password",
    "local_dir": "./dist",
    "remote_dir": "/var/www/test"
  }
]
```

#### 执行部署

```bash
femaker deploy

# 交互式选择部署环境：
✔ 请选择部署环境 · 测试环境
开始部署...
创建远程目录: "/var/www/test"
上传文件: "/var/www/test/index.html"
上传文件: "/var/www/test/assets/main.js"
部署成功！
```

> ⚠️ **安全提示**: 部署功能建议仅在开发和测试环境使用，生产环境建议使用更安全的 CI/CD 流程。

## 🛠️ 技术栈

FeMaker 基于以下技术构建：

- **[Rust](https://www.rust-lang.org/)** - 系统编程语言，保证高性能和内存安全
- **[Clap](https://clap.rs/)** - 命令行参数解析
- **[Dialoguer](https://github.com/console-rs/dialoguer)** - 交互式命令行界面
- **[Git2](https://github.com/rust-lang/git2-rs)** - Git 操作支持
- **[Reqwest](https://github.com/seanmonstar/reqwest)** - HTTP 客户端
- **[SSH2](https://github.com/alexcrichton/ssh2-rs)** - SSH 连接和文件传输

## 🔧 开发指南

### 本地开发

```bash
# 克隆项目
git clone https://github.com/luozyiii/femaker-cli.git
cd femaker-cli

# 构建项目
cargo build

# 运行测试
cargo test

# 本地安装
cargo install --path .
```

### 代码规范

项目使用 `rustfmt` 进行代码格式化，建议配置 VS Code：

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

### 发布流程

```bash
# 1. 登录 crates.io (需要先在 https://crates.io/settings/tokens 获取 token)
cargo login <your-token>

# 2. 构建项目
cargo build --release

# 3. 生成文档
cargo doc --no-deps

# 4. 发布到 crates.io
cargo publish
```

## 📚 相关资源

- [Rust 官方学习资源](https://www.rust-lang.org/learn)
- [Crates.io 包管理](https://crates.io/)
- [Rust CLI 开发指南](https://rust-cli.github.io/book/tutorial/index.html)
- [Clap 命令行解析教程](https://docs.rs/clap/latest/clap/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🔗 链接

- [GitHub 仓库](https://github.com/luozyiii/femaker-cli)
- [Crates.io 页面](https://crates.io/crates/femaker)

---

如果 FeMaker 对你有帮助，请给个 ⭐️ 支持一下！
