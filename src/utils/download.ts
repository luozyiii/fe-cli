const path = require('path');
const fse = require('fs-extra');
const gitclone = require('git-clone/promise');
import { log, spinner } from './index';

export const downloadTemplate = async (templateGitUrl: string, downloadPath: string) => {
  const loadingSpinner = spinner('正在下载模版');
  const res = await gitclone(templateGitUrl, downloadPath, { shallow: true });
  if (!res) {
    fse.removeSync(path.join(downloadPath, '.git'));
    loadingSpinner.stop();
    console.log('');
    log.success('模板下载成功');
  }
};
