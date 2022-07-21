const log = require('npmlog');

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'; // 判断debug 模式
log.heading = 'fe'; // 自定义头部
log.addLevel('success', 2000, { fg: 'green', bold: true }); // 自定义success日志
log.addLevel('notice', 2000, { fg: 'blue', bg: 'black' }); // 自定义notice日志

export default log;
