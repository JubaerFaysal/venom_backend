import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './customers/customers.module';
import { Customer } from './customers/entities/customer.entity';
import { Medicine } from './medicines/entities/medicine.entity';
import { MedicinesModule } from './medicines/medicines.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order_item.entity';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || 'jubaer',
      password: process.env.DB_PASS || '01641420456',
      database: process.env.DB_NAME || 'vonome_db',
      entities: [Customer, Medicine, Order, OrderItem],
      synchronize: true,
    }),
    CustomersModule,
    MedicinesModule,
    OrdersModule,
  ],
})
export class AppModule {}