import type { Response } from 'express';
import type { BaseRequest } from '../../models';
import type { AccessToken } from '../../service/token/models/access-token';
import { AuthErrors } from '../../../api/auth/auth.errors.enum';
import AuthenticationError from './errors/authentication-error';
import TokenService from '../../service/token/token.service';
import * as Mongo from 'mongodb';
import AuthorizationError from './errors/authorization-error';

function injectTokens(req: BaseRequest): void {
  const accessToken: string | undefined = req.cookies['access-token'];
  const skills: string | undefined = req.header('skills');
  const specialization: string | undefined = req.header('specialization');
  const coordinates: [number, number] | undefined = req
    .header('coordinates')
    ?.split(',')
    .map((val) => +val)
    .slice(0, 2) as [number, number];

  req.sender = accessToken ? TokenService.decrypt<AccessToken>(accessToken) : undefined;
  req.isAsMode = !!req.sender?.rootId && req.sender.id !== req.sender.rootId;
  req.language = req.header('lang') || undefined;
  req.currency = req.header('currency') || undefined;
  req.coordinates = coordinates || undefined;
  req.skills = skills ? skills.split(',') : undefined;
  req.specialization = specialization ? specialization.split(',') : undefined;
  req.development = req.header('mode') === 'development';
}

export async function optionalAuth(req: BaseRequest, res: Response, next: Function): Promise<void> {
  injectTokens(req);

  next();
}

export async function requireAuth(req: BaseRequest, res: Response, next: Function): Promise<void> {
  injectTokens(req);

  if (!req.sender) {
    throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
  }

  try {
    new Mongo.ObjectId(req.sender?.id);
  } catch (err) {
    throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
  }

  next();
}
