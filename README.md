# 简单优雅的前端脚手架 fe-cli

## 目标：提高前端的研发效能

- 前端研发核心流程：项目初始化 => 研发阶段 => 测试环境（发布） => 生产环境
- 核心：人为操作 => 流程标准化（简单的说就是自动化）
- 项目初始化流程的标准化：提供统一的模版选择 => 初始化项目(代码风格的标准化/commit 标准化/npm run release)
- 测试环境发布流程的标准化：选择发布环境 => 部署过程 => 成功 => 生成部署前后文件差异日志
- 生产环境发布流程的标准化： 项目里使用 npm release-it , 配置 .release-it.json； github 上配置 tag 触发自动构建。

## 使用

```bash
# 安装
npm i @leslies/fe-cli -g

# 添加模版
fe add

# 查看模板
fe list

# 创建项目  <project-name> ： 项目名称，中横线分割
fe create <project-name>

# 发布 开发/测试环境
fe deploy
```

### fe create <project-name>

项目初始化的标准流程：

```bash
# 初始化 abc-test 项目
fe create abc-test
fe info v1.0.1
? 请选择初始化类型 项目
? 请选择项目模板 Taro小程序模板
正在下载模版... \
fe success 模板下载成功

# 先创建远程仓库，然后 本地仓库与远程仓库关联
cd abc-test
git init
git add .
git commit -m "first commit"
git branch -M main # 主分支重命名为 main
git remote add origin https://github.com/luozyiii/abc-test.git
git push -u origin main # 强制推送

```

### fe add 添加模版

将平时喜欢的项目模版添加到 fe 脚手架(仅支持 git 仓库)

```bash
luozhiyi@luozhiyideMacBook-Pro: ~ $fe add
fe info v1.0.1
fe notice 开始添加模版...
? 请选择添加模版的类型 项目
? 请输入项目名称 Taro小程序模板
? 请输入项目仓库Git地址 https://github.com/luozyiii/taro-app.git
fe success 模版添加成功...
```

### fe list 查看模版

```bash
luozhiyi@luozhiyideMacBook-Pro: ~ $fe list
fe info v1.0.1
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

### 正式环境标准化发布流程

思路：代码合并到 mian 主分支 => 借助 release-it 自动打 tag，生成 CHANGELOG.md, => github 仓库上配置 tag 触发构建

```bash
# tag自动化：建议在模版上做好这一步
# 安装依赖
npm i release-it @release-it/conventional-changelog --save-dev
# 项目根目录 新建 .release-it.json
{
  "git": {
    "commitMessage": "chore: release v${version}",
    "tagName": "v${version}"
  },
  "github": {
    "release": true
  },
  "plugins": {
    "@release-it/conventional-changelog": {
      "infile": "CHANGELOG.md",
      "preset": {
        "name": "conventionalcommits",
        "types": [
          {
            "type": "feat",
            "section": "Features"
          },
          {
            "type": "fix",
            "section": "Bug Fixes"
          },
          {}
        ]
      }
    }
  }
}
# 配置脚本 package.json
"scripts": {
  "release": "release-it",
},

# 常用命令
# major 1.0.0 => 1.0.1
npm run release --major

# minor 1.0.0 => 1.1.0
npm run release --minor

# patch 1.0.0 => 2.0.0
npm run release --patch
```

## 感谢支持

##### [Github](https://github.com/luozyiii/fe-cli)

##### [npm](https://www.npmjs.com/package/@leslies/fe-cli)
