import BaseClass from './BaseClass';

class ProjectTypeEnum extends BaseClass {
  constructor() {
    super([
      ['project', { code: 'project', text: '项目' }],
      ['component', { code: 'component', text: '组件' }],
      ['other', { code: 'other', text: '其它' }],
    ]);
  }
}

export default new ProjectTypeEnum();
