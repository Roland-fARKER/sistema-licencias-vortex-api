import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ 
            where: { email },
            select: ['id', 'email', 'password', 'name', 'role', 'refreshToken'] 
        });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async create(userData: Partial<User>): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password || '', 10);
        const user = this.usersRepository.create({
            ...userData,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }

    async update(id: string, userData: any): Promise<any> {
        await this.usersRepository.update(id, userData);
        return this.findOneById(id);
    }

    async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<any> {
        const user = await this.usersRepository.findOne({ 
            where: { id },
            select: ['password']
        });
        
        if (!user) throw new Error('User not found');
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) throw new Error('Current password does not match');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersRepository.update(id, { password: hashedPassword });
        return { message: 'Password updated successfully' };
    }

    async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
        let hashedToken: string | null = null;
        if (refreshToken) {
            hashedToken = await bcrypt.hash(refreshToken, 10);
        }
        await this.usersRepository.update(id, { refreshToken: hashedToken as any });
    }

    async compareRefreshToken(id: string, refreshToken: string): Promise<boolean> {
        const user = await this.usersRepository.findOne({ 
            where: { id },
            select: ['refreshToken']
        });
        if (!user || !user.refreshToken) return false;
        return bcrypt.compare(refreshToken, user.refreshToken);
    }

}
