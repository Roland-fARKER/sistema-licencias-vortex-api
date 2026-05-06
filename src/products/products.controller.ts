import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @ApiOperation({ summary: 'List all products' })
    findAll() {
        return this.productsService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Create a new product' })
    create(@Body() product: any, @Req() req: any) {
        return this.productsService.create(product, req.user.userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a product' })
    update(@Param('id') id: string, @Body() product: any, @Req() req: any) {
        return this.productsService.update(id, product, req.user.userId);
    }

    @Post(':id/upload')
    @ApiOperation({ summary: 'Upload product image' })
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/products',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    async uploadImage(@Param('id') id: string, @UploadedFile() file: any, @Req() req: any) {
        const imageUrl = `/uploads/products/${file.filename}`;
        return this.productsService.update(id, { imageUrl }, req.user.userId);
    }
}
