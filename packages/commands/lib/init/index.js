const inquirer = require("inquirer");
const semver = require("semver");
const Command = require("@cook-cli/command");
const { log } = require("@cook-cli/utils");
const fs = require("fs");
const fse = require("fs-extra");
const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = (this._argv[1] && this._argv[1].force) || false;
    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  exec() {
    try {
      // 1. 准备阶段
      this.prepare();
      // 2. 下载模板
      // 3. 安装模板
    } catch (error) {
      console.log(error.message);
    }
  }

  async prepare() {
    // 1. 获取当前路径,判断当前目录是否为空
    // const localPath = process.cwd();
    const localPath = "C:\\work\\git\\my-project\\test";
    const isEmpty = this.isDirEmpty(localPath);
    let isContinue = false;

    if (!isEmpty) {
      if (!this.force) {
        // 询问用户是否继续
        const res = await inquirer.prompt([
          {
            type: "confirm",
            name: "isContinue",
            message: "当前文件夹内容不为空，是否在些继续创建项目？",
            default: false,
          },
        ]);

        isContinue = res.isContinue;
        if (!isContinue) {
          return false;
        }
      }

      // 2. 是否强制更新
      if (this.force || isContinue) {
        const { isDelete } = await inquirer.prompt([
          {
            type: "confirm",
            name: "isDelete",
            message: "是否清空当前目录下的文件?",
            default: false,
          },
        ]);

        if (isDelete) {
          fse.emptydirSync(localPath);
        }
      }
    }

    // 3. 选择创建项目还是组件
    // 4. 获取项目的基本信息
    return this.getInfo();
  }

  /**
   * @description: 选择创建项目或者组件 获取项目的基本信息 return Object
   * @param {*}
   * @return {*} 项目的基本信息
   */
  async getInfo() {
    const info = {};
    // 选择创建项目或者组件;
    const { type } = await inquirer.prompt({
      type: "list",
      message: "请选择初始化类型",
      name: "type",
      default: TYPE_PROJECT,
      choices: [
        {
          name: "项目",
          value: TYPE_PROJECT,
        },
        {
          name: "组件",
          value: TYPE_COMPONENT,
        },
      ],
    });

    log.verbose("type", type);

    // 获取项目的基本信息
    if (type === TYPE_COMPONENT) {
    }

    if (type === TYPE_PROJECT) {
      const o = await inquirer.prompt([
        {
          type: "input",
          message: "请输入项目名称",
          name: "project",
          validate: (a) => {
            const reg =
              /^[a-zA-Z]+([-][a-zA-Z0-9]|[_][a-zA-Z0-9]|[a-zA-Z0-9])*$/;
            if (reg.test(a)) {
              return true;
            }
            return "要求英文字母开头,数字或字母结尾,字符只允许使用 - 以及 _ ";
          },
        },
        {
          type: "input",
          message: "请输入项目版本号",
          name: "version",
          default: "1.0.0",
          validate: (a) => {
            return !!semver.valid(a) || "请输入合法的版本号";
          },
          filter: (a) => {
            if (!!semver.valid(a)) {
              return semver.valid(a);
            }
            return a;
          },
        },
      ]);
      console.log("🚀🚀 ~ InitCommand ~ o", o);
    }

    return info;
  }

  /**
   * @description: 判断当前目录是否为空
   * @param {*}
   * @return { Boolean }  true 空的  false  不是空的
   */
  isDirEmpty(localPath) {
    // 读取当前目录下所有文件
    let fileList = fs.readdirSync(localPath);
    // 过滤掉不影响的文件目录(白名单)
    fileList = fileList.filter(
      (file) => !file.startsWith(".") && ["node_modules"].indexOf(file) < 0
    );
    // 没有目录 或者 文件数量为 0 返回 true
    return !fileList || fileList.length === 0;
  }
}

const init = (argv) => {
  return new InitCommand(argv);
};

module.exports = init;
