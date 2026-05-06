import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from './entities/license.entity';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { CryptoUtils } from '../common/utils/crypto.utils';
import { ConfigService } from '@nestjs/config';
import { LicenseStatus } from '../common/enums/license-status.enum';
import { LogsService } from '../logs/logs.service';
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';

@Injectable()
export class LicensesService {
    private privateKey: string;
    private publicKey: string;

    constructor(
        @InjectRepository(License)
        private licensesRepository: Repository<License>,
        private productsService: ProductsService,
        private customersService: CustomersService,
        private configService: ConfigService,
        private logsService: LogsService,
    ) {
        let privKey = this.configService.get<string>('LICENSE_PRIVATE_KEY') || '';
        let pubKey = this.configService.get<string>('LICENSE_PUBLIC_KEY') || '';

        // .env stores PEM keys with literal \n — replace with real newlines
        this.privateKey = privKey.replace(/\\n/g, '\n');
        this.publicKey = pubKey.replace(/\\n/g, '\n');

        // If no keys are configured, generate new ones for development
        if (!this.privateKey || !this.publicKey) {
            console.warn('RSA Keys not found in .env. Generating temporary keys...');
            const keys = CryptoUtils.generateKeyPair();
            this.privateKey = keys.privateKey;
            this.publicKey = keys.publicKey;
            console.log('--- TEMPORARY PUBLIC KEY (Save this for your .NET app) ---');
            console.log(this.publicKey);
            console.log('---------------------------------------------------------');
        }
    }

    async findAll() {
        return this.licensesRepository.find({
            relations: ['product', 'customer'],
        });
    }

    async create(dto: { productId: string; customerId?: string; machineId: string; durationDays: number }, creatorId: string): Promise<License> {
        const product = await this.productsService.findOne(dto.productId);
        let customer: Customer | null = null;
        if (dto.customerId && dto.customerId !== '00000000-0000-0000-0000-000000000000') {
            customer = await this.customersService.findOne(dto.customerId);
            if (!customer) throw new NotFoundException('Customer not found');
        }

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + dto.durationDays);

        const payload = {
            cid: customer ? customer.id : null,
            pid: product.id,
            mid: dto.machineId,
            exp: endDate.toISOString().split('T')[0],
            ver: '1.0',
        };

        const licenseKey = CryptoUtils.sign(payload, this.privateKey);

        const licenseData: any = {
            product,
            machineId: dto.machineId,
            licenseKey,
            startDate,
            endDate,
            status: LicenseStatus.ACTIVE,
        };

        if (creatorId && creatorId !== 'SYSTEM' && creatorId !== 'SUBSCRIPTION_SYSTEM') {
            licenseData.createdBy = { id: creatorId };
        }

        if (customer) {
            licenseData.customer = customer;
        }

        const license = this.licensesRepository.create(licenseData);

        const savedLicense = await this.licensesRepository.save(license);

        const logData: any = {
            action: 'CREATE_LICENSE',
            entityType: 'License',
            entityId: savedLicense.id,
            details: {
                customer: customer ? customer.name : 'Anonymous',
                product: product.name,
                duration: dto.durationDays
            }
        };

        if (creatorId && creatorId !== 'SYSTEM' && creatorId !== 'SUBSCRIPTION_SYSTEM') {
            logData.user = { id: creatorId };
        }

        await this.logsService.log(logData);

        return savedLicense;
    }

    async validate(serial: string, machineId: string) {
        // 1. Cryptographic validation
        const isValidSignature = CryptoUtils.verify(serial, this.publicKey);
        if (!isValidSignature) {
            return { valid: false, message: 'Invalid signature' };
        }

        // 2. Database validation
        const license = await this.licensesRepository.findOne({
            where: { licenseKey: serial },
            relations: ['product', 'customer'],
        });

        if (!license) {
            return { valid: false, message: 'License not found in database' };
        }

        if (license.status !== LicenseStatus.ACTIVE) {
            return { valid: false, message: `License is ${license.status}` };
        }

        if (license.machineId && license.machineId !== machineId) {
            return { valid: false, message: 'Hardware ID mismatch' };
        }

        if (new Date() > license.endDate) {
            license.status = LicenseStatus.EXPIRED;
            await this.licensesRepository.save(license);
            return { valid: false, message: 'License expired' };
        }

        return { valid: true, license };
    }
}
