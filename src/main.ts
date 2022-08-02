const path = require('path');
import { homedir } from 'os';
import { pathExists } from 'path-exists';
import rootCheck from 'root-check';
import addCommand from './commands/add';
import createCommand from './commands/create';
import listCommand from './commands/list';
import { DEFAULT_HOME } from './common/constant';
import { log, npm } from './utils';
const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const pkg = require('../package.json');
const semver = require('semver');
const commander = require('commander');

const program = new commander.Command();
const userHome = homedir();

async function main() {
  try {
    // 启动前阶段
    await prepare();
    // 注册指令
    registerCommand();
  } catch (e) {
    log.error(e.message);
    if (process.env.LOG_LEVEL === 'verbose') {
      console.log(e);
    }
  }
}

// 脚手架启动阶段
async function prepare() {
  checkPkgVersion();
  checkRoot();
  checkUserHome();
  await checkEnv();
  await checkGlobalUpdate();
}

// 检查版本号
function checkPkgVersion() {
  log.info(`v${pkg.version}`);
}
// root 账号启动检查和自动降级 报错
function checkRoot() {
  rootCheck();
}
// 用户主目录检查功能
const checkUserHome = async () => {
  if (!userHome || !(await pathExists(userHome))) {
    throw new Error(colors.red('当前登录用户主目录不存在!'));
  }
};

// 环境变量检查
const checkEnv = async () => {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env');
  if (await pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
  // console.log("process.env", process.env);
};

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig['cliHome'] = path.join(userHome, DEFAULT_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig['cliHome'];
}

async function checkGlobalUpdate() {
  /**
   * 1、获取当前版本号和模块名
   * 2、调用npm api,获取所有版本号
   * 3、提取所有版本号，比对哪些版本号是大于当前版本号
   * 4、获取最新版本号，提示用户更新到该版本
   */
  const curVersion = pkg.version;
  const npmName = pkg.name;
  const lastVersion = await npm.getNpmSemverVersion(curVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, curVersion)) {
    log.warn(
      colors.yellow(`更新提示: 请手动更新
      当前版本: v${curVersion}, 最新版本:v${lastVersion}
      更新命令: npm install -g ${npmName}`),
    );
  }
}

// 注册命令
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false);

  // 注册 create 命令
  program
    .command('create [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .action((projectName) => {
      let opts = { projectName, ...program.opts() };
      createCommand(opts);
    });

  // 注册 add 命令: 增加模版
  program.command('add').action(() => {
    addCommand();
  });

  // 注册 list 命令：查看已有模板
  program.command('list').action(() => {
    listCommand();
  });

  // 开启 debug 模式
  program.on('option:debug', () => {
    if (program.opts().debug) {
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
    log.verbose('debug', '打开调试模式');
  });

  // 对未知命令的监听
  program.on('command:*', (obj) => {
    log.notice(`无效命令: ${obj[0]}`);
    const availableCommmands = program.commands.map((cmd) => cmd.name());
    if (availableCommmands.length > 0) {
      log.notice(`有效命令: ${availableCommmands.join('、')}`);
    }
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log('');
  }
}

export default main;
