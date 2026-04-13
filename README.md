# Vonome Task - Pharmacy Management System

A comprehensive REST API for managing pharmacy operations including medicines, customers, and orders built with NestJS and TypeORM.

## Features

- **Medicines Management**
  - CRUD operations for medicines
  - Search by name, generic name, or barcode
  - Filter by brand, stock status, and discounts
  - Pagination support
  - Real image URLs for medicine products

- **Customer Management**
  - Create and manage customer profiles
  - Track customer information

- **Orders Management**
  - Create orders with multiple medicine items
  - Automatic VAT calculation
  - Discount support
  - Fetch orders with related items and customer details
  - Order history and listing

- **Inventory Management**
  - Track stock quantities
  - Automatic stock updates on orders
  - In-stock and out-of-stock filtering

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Validation**: Class Validator & Class Transformer
- **API Documentation**: REST API

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file in the root directory with your PostgreSQL configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=vonome_task
PORT=3000
```

## Running the Application

```bash
# Development mode (with watch)
npm run start:dev

# Production mode
npm run start:prod

# Build only
npm run build
```

The server will start on `http://localhost:3000` by default.

## Project Structure

```
src/
├── app.module.ts                 # Root module
├── main.ts                       # Application entry point
├── medicines/                    # Medicines module
│   ├── medicines.service.ts      # Business logic
│   ├── medicines.controller.ts   # API endpoints
│   ├── medicines.module.ts       # Module configuration
│   ├── entities/
│   │   └── medicine.entity.ts    # Database entity
│   └── dto/
│       ├── medicine.dto.ts       # Create DTO
│       └── update_medicine.dto.ts # Update DTO
├── customers/                    # Customers module
│   ├── customers.service.ts
│   ├── customers.controller.ts
│   ├── customers.module.ts
│   ├── entities/
│   │   └── customer.entity.ts
│   └── dto/
│       └── customer.dto.ts
└── orders/                       # Orders module
    ├── orders.service.ts
    ├── orders.controller.ts
    ├── orders.module.ts
    ├── entities/
    │   ├── order.entity.ts
    │   └── order_item.entity.ts
    └── dto/
        ├── order.dto.ts
        └── payment.dto.ts
```

## API Endpoints

### Medicines

- `GET /medicines` - List all medicines with pagination and filters
- `GET /medicines/:id` - Get medicine by ID
- `POST /medicines` - Create a new medicine
- `PUT /medicines/:id` - Update medicine
- `DELETE /medicines/:id` - Delete medicine
- `POST /medicines/seed` - Seed database with sample medicines

### Customers

- `GET /customers` - List all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create a new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Orders

- `GET /orders` - List all orders with pagination
- `GET /orders/:id` - Get order with items by ID
- `POST /orders` - Create a new order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

## Database Entities

### Medicine
- id (Primary Key)
- name (String)
- generic (String)
- barcode (Unique String)
- brand (String)
- price (Decimal)
- stockQuantity (Integer)
- isDiscounted (Boolean)
- discountPercent (Decimal)
- imageUrl (String)
- createdAt (Timestamp)
- updatedAt (Timestamp)

### Customer
- id (Primary Key)
- name (String)
- email (String)
- phone (String)
- address (String)
- createdAt (Timestamp)
- updatedAt (Timestamp)

### Order
- id (Primary Key)
- customerId (Foreign Key)
- subtotal (Decimal)
- discountAmount (Decimal)
- vatAmount (Decimal)
- totalAmount (Decimal)
- discountPercent (Decimal)
- status (String)
- items (One-to-Many relationship)
- createdAt (Timestamp)
- updatedAt (Timestamp)

### OrderItem
- id (Primary Key)
- orderId (Foreign Key)
- medicineId (Foreign Key)
- quantity (Integer)
- unitPrice (Decimal)
- totalPrice (Decimal)

## Query Examples

### Medicines
```bash
# Search medicines
GET /medicines?search=paracetamol

# Filter by brand
GET /medicines?brand=Square

# Filter by stock status
GET /medicines?filter=in-stock

# Filter by discount
GET /medicines?filter=discount

# Pagination
GET /medicines?page=1&limit=10
```

### Orders
```bash
# List orders with pagination
GET /orders?page=1&limit=20

# Get specific order with items
GET /orders/1
```

## Key Features Implementation

### Pagination
Medicines endpoint supports pagination with configurable page size (default: 20, max: 100).

### Search & Filtering
- Search medicines by name, generic name, or barcode
- Filter by brand, stock status (in-stock, out-of-stock), or discount status

### Automatic Calculations
- VAT calculation at 15% on orders
- Discounted price calculation based on discount percentage
- Automatic stock updates when orders are created

### Data Validation
Global validation pipe ensures:
- Whitelist validation (only defined properties)
- Type transformation
- DTO validation using class-validator decorators

## License

UNLICENSED

## Author

Jubaer Ahmed Faysal
