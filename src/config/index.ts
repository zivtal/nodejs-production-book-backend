import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.dev.env';
const env = dotenv.config({ path: path.join(__dirname, '../../', envFile) });

if (env.error) {
  console.error(`Can't load ${envFile} file`, env.error);
}

const config = {
  DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE!,
  AUTH_ACTIONS: process.env.AUTH_ACTIONS?.split(','),
  AUTH_ACTIONS_LOGGED_IN: process.env.AUTH_ACTIONS_LOGGED_IN?.split(','),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  PORT: process.env.PORT || 3030,
  TOKEN_KEY: process.env.TOKEN_KEY!,
  DB_NAME: process.env.DB_NAME!,
  DB_RUI: process.env.DB_RUI!,
  JWT: {
    accessKey: process.env.JWT_ACCESS_KEY,
    refreshKey: process.env.JWT_REFRESH_KEY,
    accessOption: {
      expiresIn: '1d',
      algorithm: 'HS256',
    },
    refreshOption: {
      expiresIn: '7d',
      algorithm: 'HS256',
    },
  },
  GOOGLE: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  GOOGLE_API: {
    MAPS: process.env.GOOGLE_MAPS_API_KEY,
    YOUTUBE: process.env.YOUTUBE_API_KEY,
  },
  AWS: {
    BUCKET_NAME: process.env.SPACES_BUCKET_NAME || '',
    ACCESS_ID: process.env.SPACES_ACCESS_KEY_ID || '',
    ACCESS_KEY: process.env.SPACES_SECRET_ACCESS_KEY || '',
  },
  MAIL_CHIMP: process.env.MAIL_CHIMP_API_KEY || '',
  CORS: [
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'http://127.0.0.1:8081',
    'http://localhost:8081',
    'http://127.0.0.1:3030',
    'http://localhost:3030',
    // laptop static ip
    'http://192.168.100.203:3030',
    'http://192.168.100.203:8080',
    'http://192.168.100.100:3030',
    'http://192.168.100.100:8080',
    'http://192.168.100.100:8081',
    // iphone static ip
    'http://192.168.100.105:3030',
    'http://192.168.100.105:8080',
    'http://192.168.100.105:8081',
    // digitalocean
    'https://production-book-frontend-u2o65.ondigitalocean.app',
    'https://production-book-backend-cdkfc.ondigitalocean.app',
    //production
    'https://api.productionbook.io',
    'https://productionbook.io',
    'https://www.productionbook.io',
    //developer
    'https://dev.productionbook.io',
    'https://api.dev.productionbook.io',
  ],
};

export default config;
