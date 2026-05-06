import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_REFRESH_SECRET') || 'vortex_refresh_secret_secure_2024',
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: any) {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            throw new UnauthorizedException('Refresh token missing');
        }
        const refreshToken = authHeader.replace('Bearer', '').trim();
        return { ...payload, refreshToken };
    }
}
