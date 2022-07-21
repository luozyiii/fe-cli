const importLocal = require("import-local");
import log from "./utils/log";
import core from "./main";
// console.log("__filename", __filename);
if (importLocal(__filename)) {
  log.info("cli", "正在使用 fe-cli 本地版本");
} else {
  // console.log(process.argv.slice(2));
  core();
}
