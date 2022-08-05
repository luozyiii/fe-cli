# fe-cli

搭建适合自己的脚手架：实现项目初始化和项目自动化发布(还在开发)两大核心功能。

## 命令

```bash
# 安装
npm i @leslies/fe-cli -g

# 添加模版
fe add

# 查看模板
fe list

# 创建项目  <project-name> ： 项目名称，中横线分割
fe create <project-name>
```

## 目录结构

```bash
├── .husky                      # git hooks钩子，commit 时校验
├── .vscode                     # vscode 自定义工作区
├── bin                         # 脚手架入口
├── lib                         # 打包后源码
├── src # 源码目录
│   ├── commands                # 命令实现
│   │   ├── add.ts              # fe add 增加模板
│   │   ├── create.ts           # fe create <project-name> 项目初始化
│   │   └── list.ts             # fe list 查看模板
│   ├── common                  # 公用
│   ├── enum                    # 枚举值
│   ├── utils                   # 工具函数
│   ├── index.ts                # 入口
│   └── main.ts                 # 主要逻辑
├── .eslintrc.js                # eslint 配置
├── .gitignore                  # git忽略文件
├── .prettierrc                 # prettier 配置
├── commitlint.config.js        # commitlint 配置
├── package.json                # Node.js manifest
├── README.md                   # 文档说明
├── rollup.config.js            # rollup 打包配置
├── rollup.dev.config.js        # rollup 开发打包配置

```

## 项目初始化和制定规范

### ts + rollup

使用 ts 开发，rollup 打包成 commonjs 模块

```ts
rollup.dev.config.js;
```

### eslint + prettierrc

vscode 需安装 eslint 和 prettierrc 插件

- [eslint-config-alloy](https://github.com/AlloyTeam/eslint-config-alloy#typescript)

配置文件`.eslintrc.js`

- `.prettierrc.js`

### 新版 husky + lint-staged + commit 规范

- 1、安装 husky

```bash
npm i husky --save-dev
```

- 2、在 package.json 中添加 prepare 脚本

```ts
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

- 3、执行 prepare 脚本

```bash
npm run prepare
# 执行 husky install命令，该命令会在根目录创建.husky/目录
```

- 4、运行以下命令

```bash
npx husky add .husky/pre-commit "npm run lint"
```

- 5、添加 commit-msg 脚本

```bash
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

- 6、安装 lint-staged，并在 package.json 文件中配置 lint 的命令

```bash
npm i lint-staged --save-dev
```

```ts
{
  "scripts": {
    "lint": "lint-staged",
  }
}
```

- 7、进行 lint-staged 配置

```ts
// 方法一：package.json 中配置
"lint-staged": {
  "src/**/*.(js|ts)": [
    "npx prettier --write",
    "eslint --ext .js,.tsx,.ts,.jsx src"
  ]
}
```

```ts
// 方法二：跟目录新建lint-staged.config.js文件配置
"use strict";
module.exports = {
  ignore: ["package-lock.json"],
  linters: {
    "src/**/*.(js|ts)":[
      "npx prettier --write",
      "eslint --ext .js,.tsx,.ts,.jsx src"
    ]
}
```

- 8、定制提交规范

```bash
npm install --save-dev @commitlint/config-conventional @commitlint/cli
```

```ts
// 根目录 commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['upd', 'feat', 'fix', 'refactor', 'docs', 'chore', 'style', 'revert']],
    'type-case': [0],
    'type-empty': [0],
    'scope-empty': [0],
    'scope-case': [0],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 72],
  },
};
```
