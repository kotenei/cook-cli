const axios = require("axios");
const urlJoin = require("url-join");
const semver = require("semver");

// 获取 npm 模块信息
const getNpmInfo = async (npmName, register) => {
  if (!npmName) {
    return null;
  }
  // 获取镜像地址 ,如果没有传递参数则默认使用 npm 源
  const registerUrl = register || getRegister();

  // 拼接url
  const npmInfoUrl = urlJoin(registerUrl, npmName);

  // 调用 npm API 获取数据
  return axios
    .get(npmInfoUrl)
    .then((res) => {
      if (res.status === 200) {
        return res.data;
      }
      return null;
    })
    .catch((e) => {
      return Promise.reject(e);
    });
};

/**
 * @description: 获取 npm 镜像地址
 * @param {*} origin 源
 * @return {*} 镜像地址
 */
const getRegister = (origin = "npm") => {
  const originList = {
    npm: "https://registry.npmjs.org/",
    taobao: "https://registry.npmmirror.com/",
  };
  return originList[origin];
};

// 获取模块版本号数组
const getNpmVersions = async (npmName, register) => {
  const data = await getNpmInfo(npmName, register);
  if (data) {
    return Object.keys(data.versions);
  }
  return [];
};

const getNpmSemverVersions = (baseVersion, versions) => {
  if (!versions || !versions.length) {
    return [];
  }
  return versions
    .filter((version) => semver.satisfies(version, `>=${baseVersion}`))
    .sort((a, b) => semver.gt(b, a));
};

const getNpmSemverVersion = async (baseVersion, npmName, register) => {
  const versions = await getNpmVersions(npmName, register);
  const newVersions = getNpmSemverVersions(baseVersion, versions);
  return newVersions[0] || null;
};

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
  getRegister,
};
