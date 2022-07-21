"use strict";

const axios = require("axios");
import urlJoin from "url-join";
const semver = require("semver");
const semverRsort = require("semver/functions/rsort");

// 从 registry 获取 npm 的信息
async function getNpmInfo(npmName: string, registry?: string) {
  if (!npmName) {
    return null;
  }
  const registryUrl = registry || getDefaultRegistry(true);
  const npmInfoUrl = urlJoin(registryUrl, npmName);
  try {
    const res = await axios.get(npmInfoUrl);
    return res?.data;
  } catch (error) {
    console.log("error", error);
    return false;
  }
}

// 获取 registry 信息
function getDefaultRegistry(isOriginal = false) {
  return isOriginal
    ? "https://registry.npmjs.org"
    : "https://registry.npm.taobao.org";
}

// 获取某个 npm 的所有版本号
async function getNpmVersions(npmName: string, registry?: string) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

function getNpmSemverVersions(baseVersion: string, versions: string[]) {
  let lastVersions = versions.filter((version) =>
    semver.satisfies(version, `^${baseVersion}`)
  );
  return semverRsort(lastVersions);
}

// 根据指定 version 获取符合 semver 规范的最新版本号
async function getNpmSemverVersion(
  baseVersion: string,
  npmName: string,
  registry?: string
) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getNpmSemverVersions(baseVersion, versions);
  if (newVersions && newVersions.length > 0) {
    return newVersions[0];
  }
}

// 获取规范的最新版本号
async function getNpmLatestVersion(npmName: string, registry: string) {
  let versions = await getNpmVersions(npmName, registry);
  if (versions) {
    return semverRsort(versions)[0];
  }
  return null;
}

export {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion,
};
