import formatPath from './formatPath';
import log from './log';
import npm from './npm';
import request from './request';
import spinner from './spinner';

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function sleep(timeout = 1000) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

// 兼容windows
function exec(command, args, options) {
  const win32 = process.platform === 'win32';
  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  return require('child_process').spawn(cmd, cmdArgs, options || {});
}

function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const p = exec(command, args, options);
    p.on('error', (e) => {
      reject(e);
    });
    p.on('exit', (c) => {
      resolve(c);
    });
  });
}

export { log, request, npm, formatPath, spinner, isObject, sleep, exec, execAsync };
