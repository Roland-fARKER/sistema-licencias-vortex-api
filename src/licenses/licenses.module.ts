import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from './entities/license.entity';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { LogsModule } from '../logs/logs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([License]),
        ProductsModule,
        CustomersModule,
        LogsModule,
    ],
    controllers: [LicensesController],
    providers: [LicensesService],
    exports: [LicensesService]
})
export class LicensesModule { }
