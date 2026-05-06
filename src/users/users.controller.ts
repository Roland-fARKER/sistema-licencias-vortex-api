import { Controller, Get, Post, Body, Param, UseGuards, Req, UnauthorizedException, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@Req() req: any) {
        const user = await this.usersService.findOneById(req.user.userId);
        if (!user) throw new UnauthorizedException();
        const { password, refreshToken, ...result } = user;
        return result;
    }

    @Get()
    @ApiOperation({ summary: 'List all users' })
    findAll() {
        return this.usersService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Create new user' })
    create(@Body() userData: any) {
        return this.usersService.create(userData);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user profile' })
    update(@Param('id') id: string, @Body() userData: any) {
        return this.usersService.update(id, userData);
    }

    @Patch(':id/password')
    @ApiOperation({ summary: 'Change user password' })
    async changePassword(@Param('id') id: string, @Body() data: any) {
        try {
            return await this.usersService.updatePassword(id, data.currentPassword, data.newPassword);
        } catch (error: any) {
            throw new UnauthorizedException(error.message);
        }
    }
}
