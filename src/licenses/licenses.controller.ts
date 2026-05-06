import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LicensesService } from './licenses.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Licenses')
@Controller('licenses')
export class LicensesController {
    constructor(private readonly licensesService: LicensesService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'List all licenses' })
    findAll() {
        return this.licensesService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Generate a new license' })
    create(
        @Body() dto: { productId: string; customerId: string; machineId: string; durationDays: number },
        @Req() req: any
    ) {
        return this.licensesService.create(dto, req.user.userId);
    }

    @Get('validate')
    @ApiOperation({ summary: 'Validate a license (GET)' })
    @ApiQuery({ name: 'serial', description: 'The license serial' })
    @ApiQuery({ name: 'machineId', description: 'The hardware ID of the client machine' })
    validate(@Query('serial') serial: string, @Query('machineId') machineId: string) {
        return this.licensesService.validate(serial, machineId);
    }

    @Post('validate')
    @ApiOperation({ summary: 'Validate a license (POST)' })
    validatePost(@Body() dto: { serial: string; machineId: string }) {
        return this.licensesService.validate(dto.serial, dto.machineId);
    }
}
