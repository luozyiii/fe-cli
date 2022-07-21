'use strict';

var log = require("npmlog");
// import * as log from 'npmlog'
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"; // 判断debug 模式
log.heading = "fe"; // 自定义头部
log.addLevel("success", 2000, { fg: "green", bold: true }); // 自定义success日志
log.addLevel("notice", 2000, { fg: "blue", bg: "black" }); // 自定义notice日志

var importLocal = require("import-local");
if (importLocal(__filename)) {
    log.info("cli", "正在使用 fe-cli 本地版本");
}
else {
    require("./main")(process.argv.slice(2));
}
