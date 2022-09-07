# 简单优雅的前端脚手架 fe-cli

## 目标：提高前端的研发效能

- 前端研发核心流程：项目初始化 => 研发阶段 => 测试环境（发布） => 生产环境
- 核心：人为操作 => 流程标准化（简单的说就是自动化）
- 项目初始化流程的标准化：提供统一的模版选择 => 初始化项目(代码风格的标准化/commit 标准化)
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

## 感谢支持

##### [Github](https://github.com/luozyiii/fe-cli)

##### [npm](https://www.npmjs.com/package/@leslies/fe-cli)
