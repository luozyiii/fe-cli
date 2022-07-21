const importLocal = require('import-local');
import core from './main';
import log from './utils/log';

if (importLocal(__filename)) {
  log.info('cli', '正在使用 fe-cli 本地版本');
} else {
  // console.log(process.argv.slice(2));
  core();
}
