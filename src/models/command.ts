const semver = require('semver');
const colors = require('colors/safe');

import { log } from '../utils';

// 最低node版本
const LOWEST_NODE_VERSION = '12.0.0';

class Command {
  _argv: any[];
  _cmd: any;
  constructor(argv) {
    log.verbose('Command constructor', argv);
    if (!argv) {
      throw new Error('参数不能为空!');
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组!');
    }
    if (argv.length < 1) {
      throw new Error('参数列表为空!');
    }
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => {
        this.checkNodeVersion();
      });
      chain = chain.then(() => {
        this.initArgs();
      });
      chain = chain.then(() => {
        this.init();
      });
      chain = chain.then(() => {
        this.exec();
      });
      chain.catch((err) => {
        log.error(err.message);
      });
    });
  }

  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }

  // 检查node版本
  checkNodeVersion() {
    /**
     * 1、获取当前Node版本号
     * 2、对比最低版本号
     */
    const curVersion = process.version;
    const lowestVersion = LOWEST_NODE_VERSION;
    if (!semver.gte(curVersion, lowestVersion)) {
      throw new Error(colors.red(`best-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`));
    }
  }

  init() {
    throw new Error('init必须实现');
  }

  exec() {
    throw new Error('exec必须实现');
  }
}
export default Command;
