import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivationCode } from './entities/activation-code.entity';
import { LicensesService } from '../licenses/licenses.service';
import * as crypto from 'crypto';

@Injectable()
export class ActivationCodesService {
    constructor(
        @InjectRepository(ActivationCode)
        private activationCodesRepo: Repository<ActivationCode>,
        private licensesService: LicensesService
    ) {}

    async generateCodes(productId: string, count: number, durationDays: number, creatorId: string) {
        const codes: ActivationCode[] = [];
        for (let i = 0; i < count; i++) {
            const codeString = this.generateRandomCode();
            const code = this.activationCodesRepo.create({
                code: codeString,
                product: { id: productId },
                durationDays,
                createdBy: { id: creatorId }
            });
            codes.push(code);
        }
        return this.activationCodesRepo.save(codes);
    }

    findAll() {
        return this.activationCodesRepo.find({
            relations: ['product', 'customer', 'createdBy'],
            order: { createdAt: 'DESC' }
        });
    }

    private generateRandomCode(): string {
        // Generates something like VRTX-8X2F-9B1Q-4M2T
        const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
        return `VRTX-${segment()}-${segment()}-${segment()}`;
    }

    async activateCode(codeStr: string, machineId: string) {
        const code = await this.activationCodesRepo.findOne({
            where: { code: codeStr },
            relations: ['product', 'customer']
        });

        if (!code) {
            throw new NotFoundException('Código de activación inválido o no encontrado');
        }

        if (code.isUsed) {
            throw new BadRequestException('Este código ya ha sido utilizado en otro equipo');
        }

        // Mark as used
        code.isUsed = true;
        code.usedAt = new Date();
        code.machineIdLinked = machineId;
        await this.activationCodesRepo.save(code);

        // Generate the actual offline license
        // We use a dummy ID for customer if not provided, just for tracking. 
        // Real implementation might want a special "Anonymous" customer or nullable.
        const license = await this.licensesService.create({
            productId: code.product.id,
            customerId: code.customer ? code.customer.id : '00000000-0000-0000-0000-000000000000',
            machineId: machineId,
            durationDays: code.durationDays
        }, 'SYSTEM'); // SYSTEM means it was autonomously created

        return {
            licenseKey: license.licenseKey,
            expiresAt: license.endDate,
            product: code.product.name
        };
    }
}
