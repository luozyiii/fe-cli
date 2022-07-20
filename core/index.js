#!/usr/bin/env node

const importLocal = require("import-local");

if (importLocal(__filename)) {
  require("npmlog").info("cli", "正在使用 fe-cli 本地版本");
} else {
  require("./cli/main")(process.argv.slice(2));
}
