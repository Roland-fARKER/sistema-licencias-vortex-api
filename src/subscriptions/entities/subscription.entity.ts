import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    CANCELED = 'CANCELED',
    PAST_DUE = 'PAST_DUE'
}

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Customer, (customer) => customer.id)
    @JoinColumn()
    customer: Customer;

    @ManyToOne(() => Product)
    @JoinColumn()
    product: Product;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.ACTIVE,
    })
    status: SubscriptionStatus;

    @Column({ type: 'date' })
    currentPeriodStart: Date;

    @Column({ type: 'date' })
    currentPeriodEnd: Date;

    @Column({ default: true })
    autoRenew: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
