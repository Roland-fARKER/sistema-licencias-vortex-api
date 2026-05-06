import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { LicenseStatus } from '../../common/enums/license-status.enum';
import { User } from '../../users/entities/user.entity';

@Entity('licenses')
export class License {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Product, (product) => product.licenses)
    product: Product;

    @ManyToOne(() => Customer, (customer) => customer.licenses)
    customer: Customer;

    @Column({ type: 'text', nullable: true })
    licenseKey: string;

    @Column({ nullable: true })
    machineId: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column({
        type: 'enum',
        enum: LicenseStatus,
        default: LicenseStatus.ACTIVE,
    })
    status: LicenseStatus;

    @ManyToOne(() => User, (user) => user.licensesCreated)
    createdBy: User;

    @Column({ default: false })
    isOnlineOnly: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
