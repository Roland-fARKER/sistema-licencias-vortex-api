import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    // Admin endpoint to create a subscription for a customer
    @UseGuards(JwtAuthGuard)
    @Post('create')
    @ApiOperation({ summary: 'Create a subscription for a customer (Admin)' })
    create(@Body() dto: { customerId: string; productId: string; durationDays: number }) {
        return this.subscriptionsService.createSubscription(dto.customerId, dto.productId, dto.durationDays);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'Get all subscriptions' })
    findAll() {
        return this.subscriptionsService.findAll();
    }

    // Public endpoint for the .NET app to log in and get a SaaS license
    @Post('login-activate')
    @ApiOperation({ summary: 'Login and activate via active subscription (SaaS)' })
    loginActivate(@Body() dto: { email: string; pass: string; productId: string; machineId: string }) {
        return this.subscriptionsService.loginAndActivate(dto.email, dto.pass, dto.productId, dto.machineId);
    }
}
