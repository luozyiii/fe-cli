import { DEPLOY_CONFIG_PATH } from '../common/constant';
import { log } from '../utils';
const fse = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
let Client = require('ssh2-sftp-client');

const configPath = path.resolve(process.cwd(), DEPLOY_CONFIG_PATH);

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
    const curConfig = configOptions.find((item) => item.enviroment === env);
    // 开始部署
    let sftp = new Client();
    sftp
      .connect(curConfig.ssh)
      .then(async () => {
        if (await sftp.exists(curConfig.romotePath)) {
          await sftp.rmdir(curConfig.romotePath, true);
          log.notice(`远程目录清理成功!`);
        }
        log.notice(`正在部署...`);
        await sftp.uploadDir(curConfig.localPath, curConfig.romotePath);
        log.success(`${curConfig.name}部署成功!`);
      })
      .catch((err) => {
        log.error(err, 'catch error');
      })
      .finally(() => {
        sftp.end();
      });
  } catch (error: any) {
    log.error(error.message);
  }
};

export default deployCommand;
