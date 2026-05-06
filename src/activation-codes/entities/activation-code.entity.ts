import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('activation_codes')
export class ActivationCode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @ManyToOne(() => Product)
    @JoinColumn()
    product: Product;

    @ManyToOne(() => Customer, { nullable: true })
    @JoinColumn()
    customer: Customer; // The customer who bought the code

    @Column({ default: 365 })
    durationDays: number; // How long the license will be valid once activated

    @Column({ default: false })
    isUsed: boolean;

    @Column({ nullable: true })
    usedAt: Date;

    @Column({ nullable: true })
    machineIdLinked: string; // The hardware ID that consumed this code

    @ManyToOne(() => User)
    @JoinColumn()
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;
}
