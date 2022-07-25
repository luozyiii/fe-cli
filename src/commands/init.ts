const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const userHome = require('user-home');
const inquirer = require('inquirer');
const semver = require('semver');
const glob = require('glob');
const ejs = require('ejs');

import Command from '../models/command';
import Package from '../models/package';
import { execAsync, log, sleep, spinner } from '../utils';
import getProjectTemplate from './getProjectTemplate';

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';
const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';

// 命令白名单
const WHITE_COMMAND = ['npm', 'cnpm', 'yarn'];

class InitCommand extends Command {
  projectName: any;
  force: boolean;
  template: any;
  projectInfo: any;
  templateInfo: any;
  templateNpm: any;
  init() {
    this.projectName = this._argv[0] || '';
    this.force = !!this._cmd.force;
    log.verbose('projectName:', this.projectName);
    log.verbose('force:', this.force);
  }
  async exec() {
    // 业务逻辑
    try {
      // 0、判断项目模板是否存在
      const template: any = await getProjectTemplate();
      if (!template || template.length === 0) {
        throw new Error('项目模板不存在');
      }
      this.template = template;
      // 1、准备阶段
      const projectInfo = await this.prepare();
      if (projectInfo) {
        // 2、下载模版
        log.verbose('projectInfo:', projectInfo);
        this.projectInfo = projectInfo;
        await this.downLoadTemplate();
        // 3、安装模版
        await this.installTemplate();
      }
    } catch (e) {
      log.error(e);
    }
  }
  async prepare() {
    // 1、判断当前目录是否为空
    const localPath = process.cwd();
    if (!this.IsDirEmpty(localPath)) {
      let ifContinue = false;
      if (!this.force) {
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
      if (ifContinue || this.force) {
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
    return this.getProjectInfo();
  }

  async getProjectInfo() {
    function isValidName(v) {
      return !/^[a-zA-Z]+[a-zA-Z0-9_-]*$/.test(v);
    }
    let projectInfo: any = {};
    let isProjectNameValid = false;
    if (!isValidName(this.projectName)) {
      isProjectNameValid = true;
      projectInfo.projectName = this.projectName;
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
    log.verbose('type:', type);
    this.template = this.template.filter((template) => {
      return template.tag.includes(type);
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
    const projectPrompt = [];
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
    projectPrompt.push({
      type: 'list',
      name: 'projectTemplate',
      message: `请选择${title}模板`,
      choices: this.createTemplateChoice(),
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
      projectInfo.name = await require('kebab-case')(projectInfo.projectName).replace(/^-/, '');
      projectInfo.projectName = projectInfo.name;
    }
    if (projectInfo.projectVersion) {
      projectInfo.version = projectInfo.projectVersion;
    }
    if (projectInfo.componentDescription) {
      projectInfo.description = projectInfo.componentDescription;
    }
    return projectInfo;
  }

  async installTemplate() {
    if (this.templateInfo) {
      if (!this.templateInfo.type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
      }
      if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
        // 标准安装
        await this.installNormalTemplate();
      } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        // 自定义安装
        await this.installCustomTemplate();
      } else {
        throw new Error('项目模版类型无法识别！');
      }
    } else {
      throw new Error('项目模版信息不存在！');
    }
  }

  // 白名单命令检测功能
  checkCommand(cmd) {
    if (WHITE_COMMAND.includes(cmd)) {
      return cmd;
    }
    return null;
  }

  async execCommand(command, errMsg) {
    let ret;
    if (command) {
      const cmdArray = command.split(' ');
      const cmd = this.checkCommand(cmdArray[0]);
      if (!cmd) {
        throw new Error('命令不存在！命令：' + command);
      }
      const args = cmdArray.slice(1);
      ret = await execAsync(cmd, args, {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
      if (ret !== 0) {
        throw new Error(errMsg);
      }
    }
    return ret;
  }

  // ejs 动态渲染模板
  async ejsRender(options) {
    const dir = process.cwd();
    const params = {
      cwd: dir,
      ignore: options.ignore || '',
      nodir: true,
    };
    const projectInfo = this.projectInfo;
    return new Promise((resolve, reject) => {
      glob('**', params, (err, files) => {
        if (err) {
          reject(err);
        }
        Promise.all(
          files.map((file) => {
            const filePath = path.join(dir, file);
            return new Promise((resolve1, reject1) => {
              ejs.renderFile(filePath, projectInfo, {}, (err, result) => {
                if (err) {
                  log.verbose(`copy出错路径：${filePath}`);
                  reject1(err);
                } else {
                  // 重新写入
                  fse.writeFileSync(filePath, result);
                  resolve1('');
                }
              });
            });
          }),
        )
          .then(() => {
            resolve('');
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  }

  // 标准安装
  async installNormalTemplate() {
    // 拷贝模版到当前目录
    let spinnerLoading = spinner('正在安装模版');
    await sleep();
    try {
      const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
      const targetPath = process.cwd();
      fse.ensureDirSync(templatePath);
      fse.ensureDirSync(targetPath);
      await fse.copy(templatePath, targetPath);
    } catch (error) {
      throw new Error(error);
    } finally {
      spinnerLoading.stop(true);
      log.success('模版安装成功');
    }
    // ejs 动态渲染模板
    const templateIgnore = this.templateInfo.ignore || [];
    const ignore = ['node_modules/**', ...templateIgnore];
    await this.ejsRender({ ignore });
    // 依赖安装
    const { installCommand, startCommand } = this.templateInfo;
    await this.execCommand(installCommand, '依赖安装过程中失败! ');
    // 启动命令
    await this.execCommand(startCommand, '启动命令过程中失败! ');
  }

  async installCustomTemplate() {
    // 查询自定义模板的入口文件
    if (await this.templateNpm.exists()) {
      const rootFile = this.templateNpm.getRootFilePath();
      if (fs.existsSync(rootFile)) {
        log.notice('开始执行自定义模板');
        const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
        const options = {
          templateInfo: this.templateInfo,
          projectInfo: this.projectInfo,
          sourcePath: templatePath,
          targetPath: process.cwd(),
        };
        const code = `require('${rootFile}')(${JSON.stringify(options)})`;
        log.verbose('code', code);
        await execAsync('node', ['-e', code], { stdio: 'inherit', cwd: process.cwd() });
        log.success('自定义模板安装成功');
      }
    }
  }

  async downLoadTemplate() {
    /**
     * 1. 通过项目模版API获取项目模版信息
     * 1.1 通过egg.js 搭建一个后端系统
     * 1.2 通过npm存储项目模版
     * 1.3 将项目模版信息存储在mongodb数据库中
     * 1.4 通过egg.js 获取mongodb中的数据并且通过API返回
     */
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find((item) => item.npmName === projectTemplate);
    log.verbose('templateInfo', templateInfo);
    const targetPath = path.resolve(userHome, '.best', 'template');
    const storeDir = path.resolve(userHome, '.best', 'template', 'node_modules');
    const { npmName, version } = templateInfo;
    this.templateInfo = templateInfo;
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });
    if (!(await templateNpm.exists())) {
      const spinnerLoading = spinner('正在下载模板');
      await sleep();
      try {
        await templateNpm.install();
      } catch (error) {
        throw new Error(error);
      } finally {
        spinnerLoading.stop(true);
        if (await templateNpm.exists()) {
          log.success('下载模板成功');
          this.templateNpm = templateNpm;
        }
      }
    } else {
      const spinnerLoading = spinner('正在更新模板');
      await sleep();
      try {
        await templateNpm.update();
      } catch (error) {
        throw new Error(error);
      } finally {
        spinnerLoading.stop(true);
        if (await templateNpm.exists()) {
          log.success('更新模板成功');
          this.templateNpm = templateNpm;
        }
      }
    }
  }

  IsDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    // 文件过滤的逻辑
    fileList.filter((file) => !file.startsWith('.') && ['node_modules'].indexOf(file) < 0);
    return !fileList || fileList.length <= 0;
  }

  createTemplateChoice() {
    return this.template.map((item) => ({
      value: item.npmName,
      name: item.name,
    }));
  }
}

function init(argv) {
  return new InitCommand(argv);
}

export { init, InitCommand };
