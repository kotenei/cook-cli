"use strict";

const path = require("path");
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
    this.storePath = options.storePath;
    // package 的 name
    this.packageName = options.packageName;
    // package 的 Version
    this.packageVersion = options.packageVersion;
    // 缓存路径的前缀
    // this.cacheFilePathPrefix = this.packageName.replace("/", "_");
  }

  // 判断当前Package是否存在
  exists() {}

  // 安装Package
  install() {

    console.log(this.targetPath)
    return;

    npminstall({
      root: this.targetPath, // 模块路径
      storeDir: this.storeDir, // 模块安装位置
      register: npm.getRegister(), // 设置 npm 源
      pkgs: [     // 要安装的包信息
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    });
  }

  // 更新Package
  update() {}

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
    const dir = pkgDir(this.targetPath);

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
    return null;
  }
}

module.exports = Package;
