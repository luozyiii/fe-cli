class BaseClass {
  _enum: any;
  constructor(enumArray) {
    this._enum = new Map(enumArray);
    this._spreadEnum();
  }

  /**
   * 展开枚举值到类本身
   */
  _spreadEnum() {
    for (const [key, value] of this._enum.entries()) {
      this[key] = value;
    }
  }

  /**
   * 根据枚举值获取文本
   */
  getTextByCode(code) {
    // 字段不存在返回undefined
    if (code === undefined) {
      return '';
    }
    let text = this._enum.get(code).text || '';
    return text;
  }

  /**
   * 根据文本获取枚举值
   */
  getCodeByText(text) {
    // 字段不存在返回 undefined
    if (text === undefined) {
      return undefined;
    }
    for (const item of this._enum.values()) {
      if (item.text === text) {
        return item.code;
      }
    }
    return undefined;
  }

  /**
   * 获取列表
   */
  getOptions() {
    return [...this._enum.values()];
  }

  /**
   * 获取自定义列表
   */
  getCustomOptions({ code, text }) {
    return [...this._enum.values()].map((item) => {
      return {
        [code]: item.code,
        [text]: item.text,
      };
    });
  }
}
export default BaseClass;
