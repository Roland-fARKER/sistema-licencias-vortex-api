import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProductsService } from './products/products.service';
import { CustomersService } from './customers/customers.service';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private productsService: ProductsService,
    private customersService: CustomersService,
    private usersService: UsersService,
  ) { }

  async onModuleInit() {
    const products = await this.productsService.findAll();
    if (products.length === 0) {
      console.log('Seeding initial products...');
      await this.productsService.create({ name: 'Sistema de Gestión Ferretero', description: 'Vortex Hardware Management System', basePrice: 499 });
      await this.productsService.create({ name: 'Sistema de Gestión de Gimnasio', description: 'Vortex Gym Management System', basePrice: 299 });
    }

    const customers = await this.customersService.findAll();
    if (customers.length === 0) {
      console.log('Seeding initial customers...');
      await this.customersService.create({ name: 'Juan Perez', email: 'juan@example.com', company: 'Ferreteria Central' });
      await this.customersService.create({ name: 'Maria Gomez', email: 'maria@example.com', company: 'Fit Life Gym' });
    }

    // Seed initial admin
    try {
      const admin = await this.usersService.findOneByEmail('admin@vortex.com');
      if (!admin) {
        console.log('Seeding initial admin user...');
        await this.usersService.create({
          name: 'Vortex Admin',
          email: 'admin@vortex.com',
          password: 'admin123',
          role: 'ADMIN'
        });
      } else {
        // Verificar si la contraseña necesita ser re-hasheada (opcional pero útil si quedó en texto plano)
        // Por simplicidad, si el user reporta credenciales invalidas, podemos forzar un update una vez
        // await this.usersService.updatePassword(admin.id, 'admin123');
      }
    } catch (e) {
      console.log('Error seeding admin:', e.message);
    }
  }

  getHello(): string {
    return 'VORTEX Licensing API is running!';
  }
}
