import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LogsService } from '../logs/logs.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private logsService: LogsService
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: any, @Req() req: any) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            await this.logsService.log({
                action: 'LOGIN_FAILED',
                entityType: 'Auth',
                details: { email: body.email },
                ipAddress: req.ip
            });
            throw new Error('Unauthorized'); // Nest will catch this or use UnauthorizedException
        }
        
        const result = await this.authService.login(user);
        
        await this.logsService.log({
            action: 'LOGIN_SUCCESS',
            entityType: 'Auth',
            user: user,
            ipAddress: req.ip
        });

        return result;
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: any) {
        const userId = req.user.sub;
        const refreshToken = req.user.refreshToken;
        return this.authService.refreshTokens(userId, refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: any) {
        await this.authService.logout(req.user.userId);
        
        await this.logsService.log({
            action: 'LOGOUT',
            entityType: 'Auth',
            user: { id: req.user.userId } as any,
            ipAddress: req.ip
        });

        return { message: 'Logged out successfully' };
    }
}
