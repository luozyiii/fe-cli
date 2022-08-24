import { DEPLOY_CONFIG_PATH } from '../common/constant';
import { updateType } from '../enum';
import { log, spinner } from '../utils';
const fse = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const inquirer = require('inquirer');
let Client = require('ssh2-sftp-client');

const configPath = path.resolve(process.cwd(), DEPLOY_CONFIG_PATH);

const getContentHash = async (sftp, filePath) => {
  const buffer = await sftp.get(filePath);
  const hash = crypto.createHash('md5');
  hash.update(buffer, 'utf8');
  const md5 = hash.digest('hex');
  return md5;
};

const getRemoteFiles = async (sftp, homePath) => {
  const list = [];
  async function getFiles(dirPath) {
    const dirListing = await sftp.list(dirPath);
    const tasks = dirListing.map(async (item) => {
      const { type, name } = item;
      const filePath = `${dirPath}/${name}`;
      // 文件夹时继续操作里面的文件
      if (type === 'd') {
        await getFiles(filePath);
      } else {
        list.push({
          name: item.name,
          path: filePath,
          size: item.size,
          md5: await getContentHash(sftp, filePath),
        });
      }
    });
    await Promise.all(tasks);
  }
  await getFiles(homePath);
  return list;
};

// 部署前后文件差异
const diffTable = (oldList, newList) => {
  let list = [];
  // 全部都是新增的情况
  if (oldList.length === 0) {
    return newList.map((item) => {
      const { md5, ...other } = item;
      return {
        ...other,
        diff: '新增',
      };
    });
  }
  // 文件不变和文件改变 两种情况
  newList.forEach((newItem) => {
    oldList.forEach((oldItem) => {
      if (newItem.path === oldItem.path) {
        if (newItem.md5 === oldItem.md5) {
          const { md5, ...other } = newItem;
          list.push({
            ...other,
            diff: '不变',
          });
        } else {
          const { md5: oldMd5, size: oldSize } = oldItem;
          const { md5, size, ...other } = newItem;
          let diffText = size >= oldSize ? `变大: ${oldSize} => ${size}` : `变小: ${oldSize} => ${size}`;
          list.push({
            ...other,
            size,
            diff: diffText,
          });
        }
      }
    });
  });
  let diffListPath = list.map((item) => item.path);
  // 部分新增
  newList.forEach((item) => {
    if (!diffListPath.includes(item.path)) {
      const { md5, ...other } = item;
      list.push({
        ...other,
        diff: '新增',
      });
    }
  });
  // 部分删除
  oldList.forEach((item) => {
    if (!diffListPath.includes(item.path)) {
      const { md5, ...other } = item;
      list.push({
        ...other,
        diff: '删除',
      });
    }
  });
  return list;
};

const deployCommand = async () => {
  try {
    const configOptions = fse.readJsonSync(configPath);
    const envOption = configOptions.map((item) => {
      return {
        value: item.enviroment,
        name: item.name,
      };
    });
    const { env } = await inquirer.prompt({
      type: 'list',
      name: 'env',
      message: '请选择部署的环境',
      default: envOption[0].value,
      choices: envOption,
    });
    const options = configOptions.find((item) => item.enviroment === env);
    // 开始部署
    let sftp = new Client();
    let loadingSpinner: any = null;
    let oldFiles = [];
    let newFiles = [];
    sftp
      .connect(options.ssh)
      .then(async () => {
        // 校验
        const _localPath = path.resolve(process.cwd(), options.localPath);
        if (!(await fse.exists(_localPath))) {
          throw new Error(`请检查本地代码目录是否存在、配置${DEPLOY_CONFIG_PATH}是否有误!`);
        }
        // 远程目录存在
        if (await sftp.exists(options.romotePath)) {
          oldFiles = await getRemoteFiles(sftp, options.romotePath);
          const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '远程目录存在，请选择更新类型',
            default: updateType['cover'].code,
            choices: updateType.getCustomOptions({ code: 'value', text: 'name' }),
          });
          if (type === updateType['cover'].code) {
            await sftp.rmdir(options.romotePath, true);
            log.notice(`远程目录清理完毕!`);
          } else if (type === updateType['no'].code) {
            throw new Error('终止部署！');
          }
        }
      })
      .then(async () => {
        // 开始部署
        loadingSpinner = spinner('正在部署');
        await sftp.uploadDir(options.localPath, options.romotePath);
      })
      .then(async () => {
        // 部署结束
        loadingSpinner.stop();
        console.log('');
        newFiles = await getRemoteFiles(sftp, options.romotePath);
        if (newFiles.length > 0) {
          log.success('部署前后文件差异!!!');
          console.table(diffTable(oldFiles, newFiles));
        }
        log.success(`${options.name}部署成功!`);
      })
      .catch((err) => {
        log.error(err);
      })
      .finally(() => {
        sftp.end();
      });
  } catch (error: any) {
    log.error(error.message);
  }
};

export default deployCommand;
