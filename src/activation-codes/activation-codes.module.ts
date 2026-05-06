import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivationCodesService } from './activation-codes.service';
import { ActivationCodesController } from './activation-codes.controller';
import { ActivationCode } from './entities/activation-code.entity';
import { LicensesModule } from '../licenses/licenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivationCode]),
    LicensesModule // To be able to generate the actual license
  ],
  controllers: [ActivationCodesController],
  providers: [ActivationCodesService],
  exports: [ActivationCodesService]
})
export class ActivationCodesModule {}
