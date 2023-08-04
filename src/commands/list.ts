const axios = require('axios');
const clc = require('cli-color');
import { API_PATH } from '../common/constant';
import { projectType } from '../enum';

const listCommand = async () => {
  try {
    const { data } = await axios.get(`${API_PATH}/template/list`);
    const projectListText = data?.data
      .map((item) => `${clc.cyan(`【${projectType.getTextByCode(item.type)}】${item.name}`)}`)
      .join('\n');
    console.log(projectListText);
  } catch (error) {}
};

export default listCommand;
