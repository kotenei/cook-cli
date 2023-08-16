"use strict";

const path = require("path");
const pathExists = require("path-exists");
const commander = require("commander");

// 引入版本对比第三方库 semver
const semver = require("semver");
// 引入颜色库 colors
const colors = require("colors/safe");
// 引入当前脚手架的 package.json 文件
const pkg = require("../package.json");
// 引入当前项目 utils
const { log, npm } = require("@cook-cli/utils");
// 引入配置文件
const constant = require("./const");
let args, userHome;

const program = new commander.Command();

const core = async (argv) => {
  try {
    // 检查版本号
    checkPkgVersion();
    // 检查 node 版本
    checkNodeVersion();
    // 检查 root 账号
    checkRoot();
    // 检查用户主目录
    checkUserHome();
    // // 检查输入参数，判断是否开启 debug 模式
    // checkInputArgs();
    // 检查环境变量
    checkEnv();

    await checkGlobalUpdate();

    registerCommand();
  } catch (error) {
    console.log(error.message);
  }
};

const registerCommand = () => {
  // 注册 debug 模式
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false);

  // 注册命令
  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目")
    .action((projectName)=>{
      console.log(projectName)
    });

  // 获取参数
  const params = program.opts();

  // 注册 debug 命令
  program.on("option:debug", () => {
    if (params.debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }

    // 设置 log 的等级
    log.level = process.env.LOG_LEVEL;
    log.verbose("test debug");
  });

  // 监听未注册的所有命令
  program.on("command:*", (obj) => {
    const commands = program.commands.map((cmd) => cmd.name());
    log.info(colors.red("未知的命令 " + obj[0]));
    if (commands.length > 0) {
      log.info(colors.blue("支持的命令 " + commands.join(",")));
    }
  });

  program.parse(process.argv);

  // 判断是否输入命令 显示帮助文档
  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }
};

const checkGlobalUpdate = async () => {
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const lastVersion = await npm.getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      "友情提示",
      colors.yellow(
        `请更新版本:当前的版本是: ${currentVersion}, 最新版本：${lastVersion}`
      )
    );
    log.warn(
      "友情提示",
      colors.yellow("更新命令:", `npm install -g ${npmName}`)
    );
  }
};

// 检查当前用户，如果是超级用户创建，那其它用户就无法使用，需要降级处理
const checkRoot = () => {
  // 检查 root 等级并自动降级
  const rootCheck = require("root-check");
  rootCheck();
};

// 检查用户主目录
const checkUserHome = () => {
  // 引入user-home 跨操作系统获取用户主目录
  userHome = require("user-home");
  // 如果主目录不存在,抛出异常
  if (!userHome || !pathExists.sync(userHome)) {
    throw new Error(colors.red("当前登录用户主目录不存在"));
  }
};

// 解析参数,判断是否开启 debug 模式,并在全局变量中设置 log 等级
const checkInputArgs = () => {
  const minimist = require("minimist");
  args = minimist(process.argv.slice(2));
  checkArgs();
};

// 判断是否开启 debug 模式,并在全局变量中设置 log 等级
const checkArgs = () => {
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }
  // 设置 log 的等级
  log.level = process.env.LOG_LEVEL;
};

// 检查环境变量
const checkEnv = () => {
  // 引入解析环境变量的库 dotenv
  const dotenv = require("dotenv");
  // 环境变量的路径
  const dotenvPath = path.resolve(userHome, ".env");
  // 如果路径存在
  if (pathExists(dotenvPath)) {
    // 把.env的环境变量放在process.env里
    dotenv.config({
      path: dotenvPath,
    });
  }

  // 创建默认的环境变量配置
  createDefaultConfig();
  log.verbose("环境变量", process.env.CLI_HOME_PATH);
};

const createDefaultConfig = () => {
  const cliConfig = {
    home: userHome,
  };
  // 如果 CLI_HOME 存在 使用CLI_HOME
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    // 如果 CLI_HOME 不存在 使用默认配置
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  // 设置 process.env.CLI_HOME_PATH
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
};

// 权限 package 版本
const checkPkgVersion = () => {
  log.success("友情提示,当前的版本是:", pkg.version);
};

// 检查 node 版本
const checkNodeVersion = () => {
  // 获取当前 node 版本号
  const currentVersion = process.version;
  log.info("友情提示,当前的 node 版本是:", currentVersion);
  // 获取最低 node 版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  // 比对版本号
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(
        `错误：当前 node 版本过低，需要安装 v${lowestVersion} 以上版本的 Node.js`
      )
    );
  }
};

module.exports = core;
