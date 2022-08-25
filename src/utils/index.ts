import { downloadTemplate } from './download';
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

function bytesToSize(bytes, decimalPoint = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1000;
  const dm = decimalPoint;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export { log, request, npm, spinner, isObject, sleep, exec, execAsync, downloadTemplate, bytesToSize };
