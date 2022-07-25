const path = require('path');
const fse = require('fs-extra');
const pkgDir = require('pkg-dir').sync;
const pathExists = require('path-exists').sync;
const npminstall = require('npminstall');

const { isObject, formatPath, npm } = require('@best-cli/utils');
const { getDefaultRegistry, getNpmLatestVersion } = npm;

class Package {
  targetPath: any;
  storeDir: any;
  packageName: any;
  packageVersion: any;
  cacheFilePathPrefix: any;
  constructor(options) {
    if (!options) {
      throw new Error('Package类的options参数不能为🈳️!');
    }
    if (!isObject(options)) {
      throw new Error('Package类的options参数必须为对象!');
    }
    // package 的目标路径
    this.targetPath = options.targetPath;
    // 缓存package 路径
    this.storeDir = options.storeDir;
    // package name
    this.packageName = options.packageName;
    // package version
    this.packageVersion = options.packageVersion;
    // package 的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }

  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName, getDefaultRegistry());
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
  }

  // 生成指定版本的缓存路径
  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`);
  }

  // 判断当前Package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      // this.cacheFilePath C:\Users\lkjjhj\.best\dependencies\node_modules\_@imooc-cli_init@1.1.2@@imooc-cli\init
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }

  // 安装Package
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  // 更新Package
  async update() {
    await this.prepare();
    /**
     * 1、获取最新的npm模块版本号
     * 2、查询最新版本号对应的路径是否存在
     * 3、如果不存在，则直接安装最新版本
     */
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{ name: this.packageName, version: latestPackageVersion }],
      });
      this.packageVersion = latestPackageVersion;
    } else {
      this.packageVersion = latestPackageVersion;
    }

    return latestFilePath;
  }

  // 获取入口文件的路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      /**
       * 1、获取package.json所在的目录 - pkg-dir
       * 2、读取package.json -> require()
       * 3、寻找main/lib - path
       * 4、路径的兼容(macOS/windows)  formatPath
       */
      const dir = pkgDir(targetPath);
      if (dir) {
        const pkgFile = require(path.resolve(dir, 'package.json'));
        if (pkgFile?.main) {
          return formatPath(path.resolve(dir, pkgFile.main));
        }
      }
      return null;
    }
    // 使用缓存和本地指定目录 两种情况
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }
  }
}

export default Package;
