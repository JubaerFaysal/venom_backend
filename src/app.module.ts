import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './customers/customers.module';
import { MedicinesModule } from './medicines/medicines.module';
import { OrdersModule } from './orders/orders.module';
import { Customer } from './customers/entities/customer.entity';
import { Medicine } from './medicines/entities/medicine.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order_item.entity';

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
    MedicinesModule,
    CustomersModule,
    OrdersModule,
  ],
})
export class AppModule {}