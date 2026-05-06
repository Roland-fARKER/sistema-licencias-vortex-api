import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { LicensesService } from '../licenses/licenses.service';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectRepository(Subscription)
        private subscriptionsRepo: Repository<Subscription>,
        private licensesService: LicensesService,
        private customersService: CustomersService,
        private productsService: ProductsService
    ) {}

    async createSubscription(customerId: string, productId: string, durationDays: number = 30) {
        const customer = await this.customersService.findOne(customerId);
        const product = await this.productsService.findOne(productId);

        if (!customer || !product) {
            throw new NotFoundException('Customer or Product not found');
        }

        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + durationDays);

        const sub = this.subscriptionsRepo.create({
            customer,
            product,
            currentPeriodStart: start,
            currentPeriodEnd: end,
            status: SubscriptionStatus.ACTIVE
        });

        return this.subscriptionsRepo.save(sub);
    }

    findAll() {
        return this.subscriptionsRepo.find({
            relations: ['customer', 'product'],
            order: { createdAt: 'DESC' }
        });
    }

    async loginAndActivate(email: string, pass: string, productId: string, machineId: string) {
        // Find customer with password
        const customer = await this.customersService.findByEmailWithPassword(email);
        
        if (!customer || !customer.password) {
            throw new UnauthorizedException('Credenciales incorrectas o cliente no registrado.');
        }

        const isMatch = await bcrypt.compare(pass, customer.password);
        if (!isMatch) {
            throw new UnauthorizedException('Credenciales incorrectas.');
        }

        // Find active subscription for this product
        const subscription = await this.subscriptionsRepo.findOne({
            where: {
                customer: { id: customer.id },
                product: { id: productId },
                status: SubscriptionStatus.ACTIVE
            },
            relations: ['customer', 'product']
        });

        if (!subscription) {
            throw new UnauthorizedException('No se encontró una suscripción activa para este producto.');
        }

        if (new Date() > new Date(subscription.currentPeriodEnd)) {
            subscription.status = SubscriptionStatus.PAST_DUE;
            await this.subscriptionsRepo.save(subscription);
            throw new UnauthorizedException('La suscripción ha vencido. Por favor renueve su plan.');
        }

        // Calculate days remaining in subscription
        const diffTime = Math.abs(new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime());
        const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Issue a short-lived license based on the subscription
        const license = await this.licensesService.create({
            productId: subscription.product.id,
            customerId: subscription.customer.id,
            machineId: machineId,
            durationDays: durationDays
        }, 'SUBSCRIPTION_SYSTEM');

        return {
            licenseKey: license.licenseKey,
            expiresAt: license.endDate,
            product: subscription.product.name,
            subscriptionEnd: subscription.currentPeriodEnd
        };
    }
}
