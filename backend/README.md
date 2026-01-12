# Tricol - Supplier Order and Stock Management System

## Project Context

Tricol is a company specializing in the design and manufacturing of professional clothing. As part of the digitalization of its internal processes, following the implementation of the supplier management module, the management team has decided to develop a complementary module dedicated to supplier order management and FIFO stock valuation.

This module represents a strategic step towards a complete supply chain and production management system, enabling rigorous tracking of raw materials and equipment.

## Features

### Supplier Management
- Complete CRUD operations (Create, Read, Update, Delete)
- Search and filter suppliers
- Managed information: company name, full address, contact person, email, phone, city, ICE

### Product Management
- Complete CRUD operations for products
- View available stock per product
- Alert system for minimum stock thresholds
- Managed information: product reference, name, description, unit price, category, current stock, reorder point, unit of measure

### Supplier Orders Management
- Create new supplier orders
- Modify or cancel existing orders
- View list of all orders
- View specific order details
- Filter by supplier, status, period
- Associate orders with suppliers and product lists
- Automatic calculation of total order amount
- Order statuses: PENDING, VALIDATED, DELIVERED, CANCELLED
- Order reception handling

### Stock Management (FIFO Method)
- **Inbound movements**: Automatic recording upon supplier order reception
- **Outbound movements**: Stock consumption using FIFO (First In, First Out - oldest lots used first)
- **Lot traceability**: Each stock entry is identified by:
  - Unique lot number
  - Entry date
  - Quantity
  - Unit purchase price
  - Original supplier order
- **Stock consultation**:
  - Available stock per product
  - Stock valuation (FIFO)
  - Movement history
- **Alerts**: Notification when product stock falls below minimum threshold

### Exit Slip Management
Exit slips allow managing stock outflows to production workshops in a traceable manner. An exit slip is a document that formalizes the withdrawal of products (raw materials, supplies) from central stock to deliver them to a specific workshop.

**Features**:
- Create exit slip for workshop
- Add multiple products with quantities
- Validation automatically triggers FIFO outflows
- Cancellation possible (only for drafts)
- Consultation and filtering

**Exit slip includes**:
- Unique slip number
- Exit date
- Destination workshop
- List of products with quantities
- Exit reason (PRODUCTION, MAINTENANCE, OTHER)
- Status (DRAFT, VALIDATED, CANCELLED)

**Validation**: Automatically triggers FIFO stock movements
**Traceability**: Link between exit slip and stock movements

## Business Rules (FIFO Method)

### 1. Order Reception
When validating a supplier order reception, automatic creation of stock lots with unique number and entry date.

### 2. Stock Outflow
The FIFO algorithm must:
- Identify the oldest lots first
- Consume quantities in chronological order
- Handle cases where an outflow requires multiple lots
- Update remaining quantities for each lot

### 3. Valuation
Stock value calculation must use purchase prices from lots according to their entry order.

### 4. Traceability
Each movement must be recorded with references to the concerned lots.

## REST API Endpoints

Base URL: `http://localhost:8080/tricol/api/v2`

### Suppliers
- `GET /suppliers` - List all suppliers
- `GET /suppliers/{id}` - Get supplier details
- `POST /suppliers/create` - Create new supplier
- `PUT /suppliers/{id}` - Update supplier
- `DELETE /suppliers/{id}` - Delete supplier

### Products
- `GET /products` - List all products
- `GET /products/{id}` - Get product details
- `POST /products/create` - Create new product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product
- `GET /products/stock/{id}` - View product stock
- `GET /products/lowstock` - Get products below minimum threshold

### Supplier Orders
- `GET /orders` - List all orders
- `GET /orders/{id}` - Get order details
- `POST /orders/create` - Create new order
- `PUT /orders/{id}` - Update order status
- `POST /orders/{id}/receive` - Receive order (generates stock entries with FIFO lots)

### Exit Slips
- `GET /exit-slips` - List all exit slips (supports query params: ?status=DRAFT&workshop=Assembly)
- `GET /exit-slips/{id}` - Get exit slip details
- `POST /exit-slips` - Create exit slip (DRAFT status)
- `POST /exit-slips/{id}/validate` - Validate exit slip (triggers FIFO outflows)
- `POST /exit-slips/{id}/cancel` - Cancel draft exit slip

## Technical Stack

- **Framework**: Spring Boot
- **Database**: JPA/Hibernate with auto-schema generation
- **Validation**: Jakarta Validation
- **Mapping**: MapStruct
- **Build Tool**: Maven
- **Java Version**: 17+

## Project Structure

```
src/main/java/com/example/tricol/tricolspringbootrestapi/
├── controller/          # REST controllers
├── dto/
│   ├── request/        # Request DTOs
│   └── response/       # Response DTOs
├── enums/              # Enumerations
├── mapper/             # MapStruct mappers
├── model/              # JPA entities
├── repository/         # JPA repositories
└── service/
    └── impl/           # Service implementations
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL/PostgreSQL database

### Configuration
Update `application.properties` with your database configuration:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/tricol_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Build and Run
```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080/tricol/api/v2`

## Key Implementation Details

### FIFO Stock Algorithm
The system implements First In, First Out (FIFO) stock management:
- Stock lots are tracked with entry dates
- When consuming stock, the oldest lots are used first
- Each lot maintains an `availableQuantity` field
- Stock movements are linked to specific lots for complete traceability

### Exit Slip Workflow
1. Create exit slip in DRAFT status
2. Add products with requested quantities
3. Validate slip to trigger automatic FIFO consumption
4. System validates sufficient stock availability
5. Stock movements are created and linked to the exit slip
6. Product stock levels are updated

### Stock Valuation
Stock is valued using the FIFO method, ensuring accurate financial reporting based on actual purchase costs in chronological order.