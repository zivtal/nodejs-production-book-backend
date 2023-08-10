import { Secret, sign, SignOptions, verify } from 'jsonwebtoken';
import config from '../../../config';

const SECRET_KEY = config.TOKEN_KEY;

export default class TokenService {
  public static encrypt<T>(payload: T, options?: SignOptions & { secretKey?: Secret }): string {
    const { secretKey = SECRET_KEY, ...restOptions } = options || {};

    return sign(payload as string | object | Buffer, secretKey, { expiresIn: '30d', ...restOptions });
  }

  public static decrypt<T>(token: string, secretKey: Secret = SECRET_KEY): T | null {
    try {
      const validatedToken: T = verify(token, secretKey) as T;

      return validatedToken || null;
    } catch (err) {
      return null;
    }
  }
}
