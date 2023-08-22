"use strict";

const semver = require("semver");
const colors = require("colors");
const { log } = require("@cook-cli/utils");

const LOWEST_NODE_VERSION = "14.0.0";

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error("参数不可以为空!");
    }
    if (!Array.isArray(argv)) {
      throw new Error("参数必须是数组类型!");
    }
    if (argv.length < 1) {
      throw new Error("参数列表不可以为空!");
    }
    this._argv = argv;
    this.runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch((err) => log.error(err.message));
    });
  }

  checkNodeVersion() {
    // 获取当前 node 版本号
    const currentVersion = process.version;
    log.verbose("友情提示,当前的 node 版本是:", currentVersion);
    // 获取最低 node 版本号
    const lowestVersion = LOWEST_NODE_VERSION;
    // 比对版本号
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(
        colors.red(
          `错误：当前 node 版本过低，需要安装 v${lowestVersion} 以上版本的 Node.js`
        )
      );
    }
  }

  /**
   * @description:初始化参数
   * @param {*}
   * @return {*}
   */
  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }

  init() {
    throw new Error("command 必须拥有一个 init 方法");
  }

  exec() {
    throw new Error("command 必须拥有一个 exec 方法");
  }
}

module.exports = Command;
