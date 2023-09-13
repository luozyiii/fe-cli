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

### fe deploy 发布(建议只用于发布开发/测试环境) ssh2

待开发

```bash
# 1、在项目根目录配置deploy.config.json; 标准格式如下
[
  {
    "name": "开发环境",
    "enviroment": "dev",
    "ssh": {
      "host": "112.74.201.142",
      "port": 22,
      "username": "root",
      "password": "***"
    },
    "cmd": "npm run build",
    "romotePath": "/home/fe-test/dev",
    "localPath": "./lib"
  },
  {
    "name": "测试环境",
    "enviroment": "test",
    "ssh": {
      "host": "112.74.201.142",
      "port": 22,
      "username": "root",
      "password": "***"
    },
    "romotePath": "/home/fe-test/test",
    "localPath": "./dist"
  }
]

# 2、在项目根目录执行 fe deploy
luozhiyi@luozhiyideMacBook-Pro: ~/Work/project/fe-cli (git::main)$fe deploy
fe info v1.0.1
? 请选择部署的环境 开发环境
? 远程目录存在，请选择更新类型 覆盖更新
fe notice 远程目录清理完毕!
正在部署... -
fe success 部署前后文件差异!!!
┌─────────┬────────────┬──────────────────────────────┬─────────────┬────────────────────────────────┐
│ (index) │    name    │             path             │    size     │              diff              │
├─────────┼────────────┼──────────────────────────────┼─────────────┼────────────────────────────────┤
│    0    │ 'index.js' │ '/home/fe-test/dev/index.js' │ '845.45 KB' │ '变小: 895.65 KB => 845.45 KB' │
└─────────┴────────────┴──────────────────────────────┴─────────────┴────────────────────────────────┘
fe success 开发环境部署成功!
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
