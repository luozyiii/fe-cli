import { log } from "./utils/index";
const importLocal = require("import-local");

if (importLocal(__filename)) {
  log.info("cli", "正在使用 fe-cli 本地版本");
} else {
  require("./main")(process.argv.slice(2));
}
