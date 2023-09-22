# Rust 重构 fe-cli 脚手架

简单优雅的前端脚手架: 提高前端的研发效能

### fe new <project-name>

项目初始化的标准流程：

```bash
# 初始化 demo 项目
fe new demo

fe info v1.0.0
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

### fe add 添加模版

将平时喜欢的项目模版添加到 fe 脚手架(仅支持 git 仓库)

```bash
fe add

fe info v1.0.0
✔ 请选择模版类型 · 项目
请填写模版名称: Taro小程序模版
请填写模版git地址: https://github.com/luozyiii/taro-app.git
模板添加成功！
```

### fe list 查看模版

```bash
fe list

fe info v1.0.0
【项目】Taro小程序模板
【组件】小程序表单组件
【项目】pc 项目
```

### fe deploy 发布(建议只用于发布开发/测试环境)

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


# 2、在项目根目录执行 fe deploy
fe deploy

fe info v1.3.0
✔ 请选择部署环境 · 测试环境
开始部署...
创建远程目录: "/root/rust-test"
创建远程目录: "/root/rust-test/abc"
上传文件: "/root/rust-test/abc/1.txt"
上传文件: "/root/rust-test/2.txt"
部署成功！
```

## 发布

待开发

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

- [Github](https://github.com/luozyiii/fe-cli)
