#!/usr/bin/env node

const importLocal = require("import-local");

if (importLocal(__filename)) {
  require("npmlog").info("cli", "正在使用安装在当前项目中的 cook-cli");
} else {
  require("../lib")(process.argv.slice(2));
}
