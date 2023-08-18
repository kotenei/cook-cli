"use strict";

const path = require("path");

// 获取变量的数据类型
const getPrototype = (item) =>
  Object.prototype.toString.call(item).split(" ")[1].replace("]", "");

// 判断是否是对象类型
const isObject = (item) => getPrototype(item) === "Object";

// 判断是否是字符串类型
const isString = (item) => getPrototype(item) === "String";

// 判断是否是数组类型
const isArray = (item) => getPrototype(item) === "Array";

const formatPath = (p) => {
  if (p && typeof p === "string") {
    const sep = path.sep;
    if (sep === "/") {
      return p;
    } else {
      return p.replace(/\\/g, "/");
    }
  }
  return p;
};

module.exports = {
  isObject,
  isString,
  isArray,
  formatPath,
};
