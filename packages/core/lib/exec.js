const Package = require("@cook-cli/package");
const { log } = require("@cook-cli/utils");
const path = require("path");
const cp = require("child_process");

// package 的映射表
const SETTINGS = {
  init: "@cook-cli/utils",
};

// 缓存目录
const CACHE_DIR = "dependencies";

/**
 * @description: 动态加载命令
 * 1.获取 targetPath
 * 2.获取 modulePath
 * 3.生成一个 package
 * 4.提供一个 getRootFIle 方法获取入口文件
 * 5.提供 update 更新方法以及 install 安装方法
 * @return {*}
 */
const exec = async (...argv) => {
  // 获取 targetPath
  let targetPath = process.env.CLI_TARGET_PATH;
  // 获取 modulePath
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);
  // 获取 commander 实例
  const cmdObj = argv[argv.length - 1];
  // 获取命令名称 exp:init
  const cmdName = cmdObj.name();
  // 获取 package 的 name  exp:根据 init 命令 映射到 @cook-cli/init 包
  const packageName = SETTINGS[cmdName];
  // 获取 package 的 version
  const packageVersion = "0.0.2";
  // 模块安装路径
  let storeDir = "";
  // package 类
  let pkg;

  // 如何 targetPath 不存在
  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });

    if (await pkg.exists()) {
      // 更新 package
      await pkg.update();
    } else {
      // 安装 package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }

  // 获取模块入口
  const rootFile = pkg.getRootFilePath();
  if (!rootFile) {
    throw new Error("模块不存在入口文件!");
  }

  try {
    // // 在当前进程中调用
    // rootFile && require(rootFile).init(argv);
    // 在 node 子进程中调用
    const cmd = argv[argv.length - 1];
    const newCmd = Object.create(null);
    // 给参数瘦身
    Object.keys(cmd).forEach((key) => {
      if (cmd.hasOwnProperty(key) && !key.startsWith("_") && key !== "parent") {
        newCmd[key] = cmd[key];
      }
    });
    argv[argv.length - 1] = newCmd;

    const code = `require('${rootFile}').init(${JSON.stringify(argv)})`;
    const child = spawn("node", ["-e", code], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    child.on("error", (error) => {
      log.error(error.message);
      process.exit(1);
    });
    child.on("exit", (e) => {
      log.verbose("命令执行成功");
      process.exit(e);
    });
  } catch (error) {
    log.error(error);
  }
};

function spawn(command, args, options = {}) {
  const win32 = process.platform === "win32";
  const cmd = win32 ? "cmd" : command;
  const cmdArgs = win32 ? ["/c"].concat(command, args) : args;
  return cp.spawn(cmd, cmdArgs, options);
}

module.exports = exec;
