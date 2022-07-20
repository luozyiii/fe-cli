"use strict";

const path = require("path");

const Package = require("@best-cli/package");
const { log, exec: spawn } = require("@best-cli/utils");

// 配置表
const SETTINGS = {
  init: "@best-cli/init",
};

const CACHE_DIR = "dependencies";

async function exec() {
  /**
   * 1、targetPath -> modulePath
   * 2、modulePath -> Package(npm模块)
   * 3、Package.getRootFile(入口文件)
   * 4、Package.update / Package.install
   * 封装 -> 复用
   */
  let targetPath = process.env.CLI_TARGET_PATH;
  let homePath = process.env.CLI_HOME_PATH;
  let storeDir = "";
  let pkg;

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";
  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
    storeDir = path.resolve(targetPath, "node_modules");

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });

    if (await pkg.exists()) {
      // 更新package
      pkg.update();
    } else {
      // 安装package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
    if (!(await pkg.exists())) {
      log.error("本地调试文件路径不存在");
    }
  }
  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    try {
      // 在当前进程中调用，需要优化成在子进程调用
      // require(rootFile).call(null, Array.from(arguments));

      // 在node子进程中调用
      let args = Array.from(arguments);
      args = args.slice(0, args.length - 1);
      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
      const child = spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      child.on("error", (e) => {
        log.error(e.message);
        process.exit(1);
      });
      child.on("exit", (e) => {
        log.success("命令执行成功:", e);
        process.exit(e);
      });
    } catch (e) {
      log.error(e.message);
    }
  }
}

module.exports = exec;
