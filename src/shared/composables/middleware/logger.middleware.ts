import fs from 'fs';
import config from '../../../config';

const logsDir = './logs';
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

function getTime() {
  const now = new Date();

  return now.toLocaleString();
}

function doLog(level: string, ...args: Array<any>) {
  const strs = args.map((arg: any) => (typeof arg === 'string' ? arg : JSON.stringify(arg)));
  let line = strs.join(' | ');
  line = `${getTime()} - ${level} - ${line}\n`;
  fs.appendFileSync('./logs/backend.log', line);
  console.log(line);
}

export default {
  debug(...args: Array<any>) {
    if (!config.IS_PRODUCTION) doLog('DEBUG', ...args);
  },
  info(...args: Array<any>) {
    doLog('INFO', ...args);
  },
  warn(...args: Array<any>) {
    doLog('WARN', ...args);
  },
  error(...args: Array<any>) {
    doLog('ERROR', ...args);
  },
};
