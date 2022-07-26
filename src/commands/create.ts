const path = require('path');
import inquirer from 'inquirer';
import { pathExistsSync } from 'path-exists';
import { LOWEST_NODE_VERSION } from '../constant';
const semver = require('semver');
const colors = require('colors');
const fse = require('fs-extra');

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';
const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';

function checkNodeVersion() {
  /**
   * 1、获取当前Node版本号
   * 2、对比最低版本号
   */
  const curVersion = process.version;
  const lowestVersion = LOWEST_NODE_VERSION;
  if (!semver.gte(curVersion, lowestVersion)) {
    throw new Error(colors.red(`fe create 需要安装 v${lowestVersion} 以上版本的 Node.js`));
  }
}

function init(projectName = 'test-project', options) {
  return {
    name: projectName,
    ...options,
  };
}

async function prepare(options) {
  // 当前目录
  const localPath = path.join(process.cwd(), options.name);
  console.log('localPath', localPath);
  // 目录存在，是否强制创建
  if (await pathExistsSync(localPath)) {
    let ifContinue = false;
    if (!options.force) {
      // 1.1 是否继续创建
      ifContinue = (
        await inquirer.prompt({
          type: 'confirm',
          name: 'ifContinue',
          default: false,
          message: '当前文件夹不为空，是否继续创建项目？',
        })
      ).ifContinue;
      if (!ifContinue) return;
    }

    // 2、是否强制更新
    if (ifContinue || options.force) {
      // 给用户做二次确认
      const { confirmDelete } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmDelete',
        default: false,
        message: '是否确认清空当前目录下的文件？',
      });
      // 清空当前目录
      confirmDelete && fse.emptyDirSync(localPath);
    }
  }
  return getProjectInfo(options);
}

async function getProjectInfo(options) {
  function isValidName(v) {
    return !/^[a-zA-Z]+[a-zA-Z0-9_-]*$/.test(v);
  }
  let projectInfo: any = {};
  let isProjectNameValid = false;
  if (!isValidName(options.name)) {
    isProjectNameValid = true;
    projectInfo.projectName = options.name;
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
  console.log('type', type);
}

const create = async (projectName: string, options: any) => {
  checkNodeVersion();
  let opts = init(projectName, options);
  await prepare(opts);
  console.log('opts', opts);
};

export default create;
