import BaseClass from './BaseClass';

class UpdateTypeEnum extends BaseClass {
  constructor() {
    super([
      ['cover', { code: 'cover', text: '覆盖更新' }],
      ['increment', { code: 'increment', text: '增量更新' }],
      ['no', { code: 'no', text: '不更新' }],
    ]);
  }
}

export default new UpdateTypeEnum();
