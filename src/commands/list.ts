const axios = require('axios');
const clc = require('cli-color');
import { API_PATH } from '../common/constant';

const listCommand = async () => {
  try {
    const { data } = await axios.get(`${API_PATH}/list`);
    const projectListText = data?.data
      .map((item) => `${clc.cyan(`【${item.type === 'project' ? '项目' : '组件'}】${item.name}`)}`)
      .join('\n');
    console.log(projectListText);
  } catch (error) {}
};

export default listCommand;
