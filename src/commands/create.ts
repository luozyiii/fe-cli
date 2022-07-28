const path = require('path');
const semver = require('semver');
const colors = require('colors');
const fs = require('fs');
const fse = require('fs-extra');
const axios = require('axios');
const download = require('download-git-repo');
const cmd = require('node-cmd');
import inquirer from 'inquirer';
import { pathExistsSync } from 'path-exists';
import { LOWEST_NODE_VERSION } from '../constant';
import { log } from '../utils';

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

// 模版选项数据处理
function createTemplateChoice(template) {
  return template.map((item) => ({
    value: item.link,
    name: item.name,
  }));
}

function checkNodeVersion() {
  /**
   * 1、获取当前Node版本号
   * 2、对比最低版本号
   */
  const curVersion = process.version;
  const lowestVersion = LOWEST_NODE_VERSION;
  if (!semver.gte(curVersion, lowestVersion)) {
    throw new Error(colors.red(`fe create <projectName> 命令的使用，需要安装 v${lowestVersion} 以上版本的 Node.js`));
  }
}

async function prepare(options) {
  // 当前目录
  const localPath = path.join(process.cwd(), options.projectName);
  // 目录存在，是否强制创建
  if (await pathExistsSync(localPath)) {
    let ifContinue = false;
    if (!options.force) {
      ifContinue = (
        await inquirer.prompt({
          type: 'confirm',
          name: 'ifContinue',
          default: false,
          message: '目录已存在，是否清空当前目录下的文件，继续创建项目？',
        })
      ).ifContinue;
      if (!ifContinue) throw new Error('程序中断！');
    }
    fse.emptyDirSync(localPath);
    fs.rmdirSync(localPath);
    log.notice('目录清理完毕, 继续创建项目!');
  }
  return getProjectInfo(options);
}

async function getProjectTemplate() {
  try {
    const res = await axios.get('http://127.0.0.1:8080/project.json');
    return res.data;
  } catch (error) {
    return [];
  }
}

async function getProjectInfo(options) {
  function isValidName(v) {
    return !/^[a-zA-Z]+[a-zA-Z0-9_-]*$/.test(v);
  }
  let projectInfo: any = {};
  let isProjectNameValid = false;
  if (!isValidName(options.projectName)) {
    isProjectNameValid = true;
    projectInfo.projectName = options.projectName;
  }
  // 1、选择创建项目或组件/工具库
  const { type } = await inquirer.prompt({
    type: 'list',
    name: 'type',
    message: '请选择初始化类型',
    default: TYPE_PROJECT,
    choices: [
      {
        name: '项目',
        value: TYPE_PROJECT,
      },
      {
        name: '组件/工具库',
        value: TYPE_COMPONENT,
      },
    ],
  });
  const title = type === TYPE_PROJECT ? '项目' : '组件/工具库';
  const projectNamePrompt = {
    type: 'input',
    name: 'projectName',
    message: `请输入${title}名称`,
    default: '',
    validate: function (v) {
      let done = this.async();
      setTimeout(() => {
        if (isValidName(v)) {
          done(`请输入合法的${title}名称（首字符必须是字母,只能输入字母数字,下划线_,中划线-）`);
          return;
        }
        done(null, true);
      }, 0);
    },
    filter: function (v) {
      return v;
    },
  };
  const projectPrompt: any = [];
  if (!isProjectNameValid) {
    projectPrompt.push(projectNamePrompt);
  }
  projectPrompt.push({
    type: 'input',
    name: 'projectVersion',
    message: `请输入${title}版本号`,
    default: '1.0.0',
    validate: function (v) {
      let done = this.async();
      setTimeout(() => {
        if (!semver.valid(v)) {
          done('请输入合法的版本号');
          return;
        }
        done(null, true);
      }, 0);
    },
    filter: function (v) {
      if (semver.valid(v)) {
        return semver.valid(v);
      } else {
        return v;
      }
    },
  });
  const newTemplate = options?.template.filter((template) => {
    return template.tag.includes(type);
  });
  if (!newTemplate || newTemplate.length === 0) {
    throw new Error('该分类没有项目模板哈～');
  }
  projectPrompt.push({
    type: 'list',
    name: 'projectLink',
    message: `请选择${title}模板`,
    choices: createTemplateChoice(newTemplate),
  });
  if (type === TYPE_PROJECT) {
    // 2、获取项目基本信息
    const project = await inquirer.prompt(projectPrompt);
    projectInfo = {
      ...projectInfo,
      type,
      ...project,
    };
  } else if (type === TYPE_COMPONENT) {
    // 组件/工具库基本信息
    const descriptionPrompt = {
      type: 'input',
      name: 'componentDescription',
      message: '请输入组件/工具库的描述信息',
      validate: function (v) {
        let done = this.async();
        setTimeout(() => {
          if (!v) {
            done('请输入组件/工具库的描述信息');
            return;
          }
          done(null, true);
        }, 0);
      },
    };
    projectPrompt.push(descriptionPrompt);
    // 2、获取组件/工具库基本信息
    const component = await inquirer.prompt(projectPrompt);
    projectInfo = {
      ...projectInfo,
      type,
      ...component,
    };
  }
  if (projectInfo.projectName) {
    projectInfo.projectName = await require('kebab-case')(projectInfo.projectName).replace(/^-/, '');
  }
  if (projectInfo.projectVersion) {
    projectInfo.version = projectInfo.projectVersion;
  }
  if (projectInfo.componentDescription) {
    projectInfo.description = projectInfo.componentDescription;
  }
  return projectInfo;
}

const create = async (options: any) => {
  try {
    // 1.检查node版本
    checkNodeVersion();
    // 2.拉取模板数据
    const template = await getProjectTemplate();
    if (!template || template.length === 0) {
      throw new Error('项目模板不存在');
    }
    // 3.交互式询问，获取项目基本信息
    const projectInfo = await prepare({
      template,
      ...options,
    });
    // 4.拉取git 仓库, 并删除仓库 .git
    download(`direct:${projectInfo.projectLink}`, projectInfo.projectName, { clone: true }, (err) => {
      log.success('模板拉取成功');
      const localPath = path.join(process.cwd(), options.projectName);
      cmd.run(`cd ${localPath} && rm -rf .git`, (err, data, stderr) => {
        if (!err) log.notice('.git 文件跟踪已删除');
      });
    });
  } catch (error: any) {
    log.error(error.message);
  }
};

export default create;
