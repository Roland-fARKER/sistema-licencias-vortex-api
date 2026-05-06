import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { LogsService } from '../logs/logs.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        private logsService: LogsService,
    ) { }

    findAll() {
        return this.productsRepository.find();
    }

    findOne(id: string) {
        return this.productsRepository.findOneBy({ id });
    }

    async create(product: Partial<Product>, creatorId?: string) {
        const newProduct = this.productsRepository.create(product);
        const savedProduct = await this.productsRepository.save(newProduct);
        
        if (creatorId) {
            await this.logsService.log({
                action: 'CREATE_PRODUCT',
                entityType: 'Product',
                entityId: savedProduct.id,
                user: { id: creatorId } as User,
                details: { name: savedProduct.name }
            });
        }

        return savedProduct;
    }

    async update(id: string, product: Partial<Product>, updaterId: string) {
        await this.productsRepository.update(id, product);
        const updatedProduct = await this.findOne(id);

        if (updaterId) {
            await this.logsService.log({
                action: 'UPDATE_PRODUCT',
                entityType: 'Product',
                entityId: id,
                user: { id: updaterId } as User,
                details: { name: updatedProduct?.name, changes: product }
            });
        }

        return updatedProduct;
    }
}
