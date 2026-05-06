import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { License } from '../../licenses/entities/license.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column()
    name: string;

    @Column({ default: 'ADMIN' })
    role: string;

    @Column({ nullable: true, select: false })
    refreshToken: string;

    @OneToMany(() => License, (license) => license.createdBy)
    licensesCreated: License[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
