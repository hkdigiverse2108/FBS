# Food Business System (FBS)

A comprehensive solution for managing food business operations, including item management, stock tracking, sales management, and analytics.

## Features

1. Item Management
   - Add/Edit/Delete items
   - Track per kg and per bottle prices/costs
   - Item photos

2. Stock Management
   - Add/Remove stock in grams
   - Auto-calculate total grams
   - Low stock alerts

3. User Management
   - Add/Edit/Delete users (cashiers/salesmen)
   - Track individual sales by user

4. Sales Management (Billing)
   - Cash/Online sales
   - Create bills from selected items
   - Print formatted bills
   - Automatic stock deduction
   - Total collection tracking

5. Admin Dashboard (Analytics)
   - Today's statistics
   - Date-wise/Month-wise/Year-wise reports
   - Profit tracking
   - GST collection tracking

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fbs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/fbs
   ```

## Development

To run the application in development mode:

```bash
npm run dev
```

## Production

To build and run the application in production:

```bash
npm run build
npm start
```

## API Endpoints

### Items
- `POST /api/items` - Create a new item
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get a specific item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item

### Stock
- `POST /api/stock/add` - Add stock
- `POST /api/stock/remove` - Remove stock
- `GET /api/stock/current` - Get current stock levels

### Sales
- `POST /api/sales` - Create a new sale
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get a specific sale

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/reports` - Get sales reports

## License

This project is licensed under the MIT License. 