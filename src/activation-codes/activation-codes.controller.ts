import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ActivationCodesService } from './activation-codes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Activation Codes')
@Controller('activation-codes')
export class ActivationCodesController {
    constructor(private readonly activationCodesService: ActivationCodesService) {}

    // Admin endpoint to generate codes
    @UseGuards(JwtAuthGuard)
    @Post('generate')
    @ApiOperation({ summary: 'Generate new activation codes (Admin)' })
    generate(@Body() dto: { productId: string; count: number; durationDays: number }, @Req() req: any) {
        return this.activationCodesService.generateCodes(dto.productId, dto.count, dto.durationDays, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'Get all activation codes' })
    findAll() {
        return this.activationCodesService.findAll();
    }

    // Public endpoint for the .NET app to activate a code autonomously
    @Post('activate')
    @ApiOperation({ summary: 'Activate a software instance using a code (Autonomous)' })
    activate(@Body() dto: { code: string; machineId: string }) {
        return this.activationCodesService.activateCode(dto.code, dto.machineId);
    }
}
