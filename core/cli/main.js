"use strict";

const pkg = require("../../package.json");
const { log } = require("../../utils/index");

async function core() {
  try {
    await prepare();
    // registerCommand();
  } catch (e) {
    log.error(e.message);
    if (process.env.LOG_LEVEL === "verbose") {
      console.log(e);
    }
  }
}

// 脚手架启动阶段
async function prepare() {
  checkPkgVersion();
  checkRoot();
}

// 检查版本号
function checkPkgVersion() {
  log.info(`v${pkg.version}`);
}
// root 账号启动检查和自动降级 报错
function checkRoot() {
  // const rootCheck = require("root-check");
  // rootCheck();
}

module.exports = core;
