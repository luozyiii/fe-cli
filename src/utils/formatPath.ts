const path = require('path');

function formatPath(p) {
  if (p && typeof p === 'string') {
    const sep = path.sep;
    // 如果返回 / 则为 macOS
    if (sep === '/') {
      return p;
    } else {
      return p.replace(/\\/g, '/');
    }
  }
  return p;
}

export default formatPath;
