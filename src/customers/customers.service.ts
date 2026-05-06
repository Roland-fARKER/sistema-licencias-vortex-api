import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { LogsService } from '../logs/logs.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        private logsService: LogsService,
    ) { }

    findAll() {
        return this.customersRepository.find();
    }

    findOne(id: string) {
        return this.customersRepository.findOneBy({ id });
    }

    async findByEmailWithPassword(email: string) {
        return this.customersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password'] // specifically select password since it's select: false by default
        });
    }

    async create(customer: Partial<Customer>, creatorId?: string) {
        if (customer.password) {
            customer.password = await bcrypt.hash(customer.password, 10);
        }
        
        const newCustomer = this.customersRepository.create(customer);
        const savedCustomer = await this.customersRepository.save(newCustomer);
        
        if (creatorId) {
            await this.logsService.log({
                action: 'CREATE_CUSTOMER',
                entityType: 'Customer',
                entityId: savedCustomer.id,
                user: { id: creatorId } as User,
                details: { name: savedCustomer.name }
            });
        }

        return savedCustomer;
    }
}
