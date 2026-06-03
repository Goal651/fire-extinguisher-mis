import fs from 'fs';
import path from 'path';

const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'app.log');

export const logger = {
  info: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [INFO] ${message}${meta ? ` ${JSON.stringify(meta)}` : ''}\n`;
    fs.appendFileSync(logFilePath, logEntry);
    console.log(`[INFO] ${message}`, meta || '');
  },

  error: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [ERROR] ${message}${meta ? ` ${JSON.stringify(meta)}` : ''}\n`;
    fs.appendFileSync(logFilePath, logEntry);
    console.error(`[ERROR] ${message}`, meta || '');
  },

  warn: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [WARN] ${message}${meta ? ` ${JSON.stringify(meta)}` : ''}\n`;
    fs.appendFileSync(logFilePath, logEntry);
    console.warn(`[WARN] ${message}`, meta || '');
  },

  http: (method: string, url: string, status: number, responseTime: string, contentLength: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [HTTP] ${method} ${url} ${status} ${contentLength} - ${responseTime} ms\n`;
    fs.appendFileSync(logFilePath, logEntry);
  },
};
