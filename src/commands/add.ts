import inquirer from 'inquirer';
import { API_PATH } from '../common/constant';
import { projectType } from '../enum';
import { log } from '../utils';

const axios = require('axios');

async function prepare() {
  const { type } = await inquirer.prompt({
    type: 'list',
    name: 'type',
    message: '请选择添加模版的类型',
    default: projectType['project'].code,
    choices: projectType.getCustomOptions({ code: 'value', text: 'name' }),
  });
  const title = projectType.getTextByCode(type);
  const projectPrompt: any = [];
  projectPrompt.push({
    type: 'input',
    name: 'projectName',
    message: `请输入${title}名称`,
    validate: function (v) {
      let done = this.async();
      setTimeout(() => {
        if (!v) {
          done(`请输入${title}名称`);
          return;
        }
        done(null, true);
      }, 0);
    },
  });
  projectPrompt.push({
    type: 'input',
    name: 'projectUrl',
    message: `请输入${title}仓库Git地址`,
    validate: function (v) {
      let done = this.async();
      setTimeout(() => {
        if (!v) {
          done(`请输入${title}仓库Git地址`);
          return;
        }
        done(null, true);
      }, 0);
    },
  });
  const projectInfo = await inquirer.prompt(projectPrompt);
  return { ...projectInfo, projectType: type };
}

const addTemplate = async (info) => {
  try {
    const { data } = await axios.post(`${API_PATH}/template/add`, {
      name: info?.projectName,
      url: info?.projectUrl,
      type: info?.projectType,
    });
    if (data?.code === 200) {
      log.success('模版添加成功...');
    }
  } catch (error) {}
};

const addCommand = async () => {
  try {
    log.notice('开始添加模版...');
    const info = await prepare();
    addTemplate(info);
  } catch (error: any) {
    log.error(error.message);
  }
};

export default addCommand;
