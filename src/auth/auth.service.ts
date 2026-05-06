import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) return null;

        // Intentar comparar con hash (bcrypt)
        const isMatch = await bcrypt.compare(pass, user.password);
        if (isMatch) {
            const { password, ...result } = user;
            return result;
        }

        // Fallback: Si no es un hash de bcrypt y coincide exactamente (solo para migración inicial)
        if (pass === user.password && !user.password.startsWith('$2b$')) {
            console.log(`Migrating user ${email} to hashed password...`);
            // Hashear y actualizar para la próxima vez
            const hashedPassword = await bcrypt.hash(pass, 10);
            await this.usersService.update(user.id, { password: hashedPassword });
            const { password, ...result } = user;
            return result;
        }

        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET') || 'vortex_refresh_secret_secure_2024',
            expiresIn: '7d',
        });

        await this.usersService.updateRefreshToken(user.id, refreshToken);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.usersService.findOneById(userId);
        if (!user) throw new UnauthorizedException('User not found');

        const isTokenValid = await this.usersService.compareRefreshToken(userId, refreshToken);
        if (!isTokenValid) throw new UnauthorizedException('Invalid refresh token');

        const payload = { email: user.email, sub: user.id, role: user.role };
        const newAccessToken = this.jwtService.sign(payload);
        const newRefreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET') || 'vortex_refresh_secret_secure_2024',
            expiresIn: '7d',
        });

        await this.usersService.updateRefreshToken(user.id, newRefreshToken);

        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
        };
    }

    async logout(userId: string) {
        await this.usersService.updateRefreshToken(userId, null);
    }
}
