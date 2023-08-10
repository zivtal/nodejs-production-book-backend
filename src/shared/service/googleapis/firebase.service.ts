import firebaseAdmin from 'firebase-admin';
import type { BaseMessage, BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';

export default class FirebaseService {
  readonly credential: Record<string, any> = {
    type: 'service_account',
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PROJECT_KEY_ID,
    privateKey:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDXgwUjtBeMdWUb\nvR/z43SGJXhREpeg7dR/zV8AUw+Wx9t9EauSuowPFM+/REEb5s1RzlkF2n20SY1O\ntDgRzSnuau9j672qS4VWnvpHaKR2IccjcZK68rwfEIskC9Fq/o7tA+jE1CgU90i8\nCQxReHjBKD3lO2a7OsAMXlUeQTk61WeWqFdI3xiU8JwgbHLLq8jXyEhZi/yDghkp\naGJJ+7yXPBimTeFQ2sSx7SbAqwXvJEgTegQYWNz3IMQkxJ2+zec+JFo4ZK6uwfX1\n5DVjkZWC/QuVZUQkQeTOTQkVOxIBzHIkd390rygms1B/wFzCyKM5vqUBQyl2rpGw\nUWMoVYaBAgMBAAECggEADKfIfvq94UUpjVHzVOaX+qKrqJMfbVdaAbFFMWcvRKry\n1Crb+O9UdzRBKNmwuxs4FmQ4LRRSCmrBTgxeOIlkO3hzG1qGFkB+EYKfbt8RvVAp\negba13iWnHpjuVeqUg6lxPxUSG6u9eA5mLUtUIFzEeCzlckBtN/z1CYb+H1bB33S\nEnZ2Kt6vov9D7hFw5HrcV5e3X+v/T9p3/vZm5jlb9t4UXJd927zkD6jwvrCYUgBg\nYKKSSVUEIwH1wf8yyDKLgUy2onb841R/qBgNdL15Iujr/MLGXmx1mEExU/wW9+2V\nCfulncfDtQM5odf3H0Afq/9s1Oe9Z82vGXrek+yQ4QKBgQDvffe2ZVucE38qV94t\nGaSiSTNMopmBi8AFBXh2TvPgdG6DDzbBWklFyqJ9Hi8eeiVq6gWE9kmKonWek6Ln\ncTCLVFI8nJ0PY7aYaHewVoeJNXpt2hkMIC+ZyIRvw14YdPbEZQYQMh+ORoUC8wMo\n6VMlJ7wqFHrZqMyJRmHqoPy0uQKBgQDmXeazOd2WIv34uqlqL8QcYfGMFfqMAbel\nKESLL7rq6+NrtG9mQki8oVAoJV8iQPbbO2swaen5F+WIe/K7GXmXZF5Gxa3KC0KC\nzBI/4nAyZJatt6espP5NgLnCc0LrP02MhFyKeKYvbRtV06zw2ZvhHBS3xKqfl2XH\n8hHKfo6MCQKBgQCnBRmhSXSnF23DEP5wQ4buatBs7KTTlKu4lMUa9RrdeTWtDwon\ntBiPpK7HRSqlPZgkxMpOnRhSp9QRYHLmp6isMoUbojlihy7LgWefQelKBlK4k7aO\nH1AzFoVOEFjqA4ApHS8qUlpxdbrDgMi+WmJS8jAmxJucej0Sq1QUNmumeQKBgGuD\nA3o91VaOei0tIIf4RvRgGZUhZM8WthiUVHkJC5k8AeVwTlVRNhUizAAQgPfBjfP/\nJSVxKMsiBfPOtRfw6bhoFT++Xj9fRek5SIMcMPSz0Ua94blHP4/4Nbm0hVS5NH4S\nAAZ4DEcyCoHhymKVjJRgwKKLXH4i8FOCfB8fNXPRAoGBAOedz/zWf59rHmnvYoCW\nH0cIIX6IQ+rGLPycbq6RGlt7OAbIem2HIuqZ9iVmJESfGGiB5ACIPKqgptBLmjWk\nAPITLAkwkGIhEHcqVcJ/s1kkGCXdhNbFttqu5wrV8EpJO0lu2Ys/ZQr/VPSoSw7e\naV4STYvHmc25nFbm9rcSS+Uu\n-----END PRIVATE KEY-----\n',
    clientEmail: `firebase-adminsdk-gyonl@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
    clientX509CertUrl: `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-gyonl%40${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
    universeDomain: 'googleapis.com',
  };

  constructor() {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(this.credential),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
  }

  public async send<T>(token: string, message: BaseMessage): Promise<string | undefined> {
    try {
      return await firebaseAdmin.messaging().send({ token, ...message });
    } catch (e: any) {
      console.error('firebaseService:send', e.message);
    }
  }

  public async sendEachForMulticast<T>(tokens: Array<string>, message: BaseMessage): Promise<BatchResponse | undefined> {
    try {
      return await firebaseAdmin.messaging().sendEachForMulticast({ tokens, ...message });
    } catch (e: any) {
      console.error('firebaseService:sendEachForMulticast', e.message);
    }
  }
}
