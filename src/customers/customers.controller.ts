import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    @ApiOperation({ summary: 'List all customers' })
    findAll() {
        return this.customersService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Create a new customer' })
    create(@Body() customer: any, @Req() req: any) {
        return this.customersService.create(customer, req.user.userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get customer by ID' })
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }
}
