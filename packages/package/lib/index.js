"use strict";

const path = require("path");
const pathExists = require("path-exists").sync;
const fse = require("fs-extra");
const npminstall = require("npminstall");
const { common, npm } = require("@cook-cli/utils");
const pkgDir = require("pkg-dir").sync;

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("Package 类的参数不能为空!");
    }
    if (!common.isObject(options)) {
      throw new Error("Package 类的参数必须是对象类型!");
    }

    // 获取 targetPath ,如果没有 则说明不是一个本地的package
    this.targetPath = options.targetPath;
    // 模块安装位置 缓存路径
    this.storeDir = options.storeDir;
    // package 的 name
    this.packageName = options.packageName;
    // package 的 Version
    this.packageVersion = options.packageVersion;
    // 缓存路径的前缀
    this.cacheFilePathPrefix = this.packageName.replace("/", "+");
  }

  /**
   * @description: 获取当前模块缓存路径
   * @param {*}
   * @return {*}
   */
  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `.store/${this.cacheFilePathPrefix}@${this.packageVersion}/node_modules/${this.packageName}`
    );
  }

  /**
   * @description: 获取最新版本模块缓存路径
   * @param {*}
   * @return {*}
   */
  getSpecificFilePath(packageVersion) {
    return path.resolve(
      this.storeDir,
      `.store/${this.cacheFilePathPrefix}@${packageVersion}/node_modules/${this.packageName}`
    );
  }

  /**
   * @description: 准备工作
   * @param {*}
   * @return {*}
   */
  async prepare() {
    // 当缓存目录不存在的时候
    if (this.storeDir && !pathExists(this.storeDir)) {
      // 创建缓存目录
      fse.mkdirpSync(this.storeDir);
    }
    // 获取最新版本
    const latestVersion = await npm.getLatestVersion(this.packageName);
    // 如果设定的版本号是最新的话，就赋值
    if (this.packageVersion === "latest" && latestVersion) {
      this.packageVersion = latestVersion;
    }
  }

  // 判断当前Package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }

  // 安装Package
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath, // 模块路径
      storeDir: this.storeDir, // 模块安装位置
      register: npm.getRegister(), // 设置 npm 源
      pkgs: [
        // 要安装的包信息
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    });
  }

  // 更新Package
  async update() {
    await this.prepare();
    // 获取最新版本号
    const latestVersion = await npm.getLatestVersion(this.packageName);

    // 查询本地是否已经是最新版本
    const localPath = this.getSpecificFilePath(latestVersion);
    const isLocalLatestVersion = pathExists(localPath);

    console.log("🚀🚀 ~ Package ~ latestVersion", latestVersion);
    console.log("🚀🚀 ~ Package ~ localPath", localPath);
    console.log("🚀🚀 ~ Package ~ isLocalLatestVersion", isLocalLatestVersion);

    // 如果不是最新版本 安装最新版本
    if (!isLocalLatestVersion) {
      await npminstall({
        root: this.targetPath, // 模块路径
        storeDir: this.storeDir, // 模块安装位置
        register: npm.getRegister(), // 设置 npm 源
        pkgs: [
          // 要安装的包信息
          {
            name: this.packageName,
            version: latestVersion,
          },
        ],
      });

      this.packageVersion = latestVersion;
    }
  }

  /**
   * @description:获取入口文件的路径
   * 1.获取package.json所在的目录 pkg-dir
   * 2.读取package.json
   * 3.找到main或者lib属性 形成路径
   * 4.路径的兼容(macOs/windows)
   * @param {*}
   * @return {*}
   */
  getRootFilePath() {
    const _getRootFile = (_path) => {
      const dir = pkgDir(_path);
      if (dir) {
        const pkgFile = require(path.resolve(dir, "package.json"));
        if (pkgFile && (pkgFile.main || pkgFile.lib)) {
          const rootPath =
            common.formatPath(path.resolve(dir, pkgFile.main)) ||
            common.formatPath(path.resolve(dir, pkgFile.lib));

          return rootPath;
        }
        return null;
      }
    };

    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath);
    }

    return _getRootFile(this.targetPath);
  }
}

module.exports = Package;
