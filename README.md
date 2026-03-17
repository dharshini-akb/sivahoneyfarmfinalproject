# Siva Honey Form - Premium Honey & Organic Products

A full-stack MERN (MongoDB, Express, React, Node.js) e-commerce application for selling premium honey and organic products.

## Features

### User Features
- User registration and login
- Browse products by category (Honey, Shampoos, Masalas, Soaps, Organic)
- Product search functionality
- Add products to shopping cart
- Secure checkout with multiple payment methods (Stripe, PayPal)
- Order tracking

### Admin Features
- Admin login
- Add, edit, and delete products
- Upload product images
- View dashboard with statistics (Total Products, Orders, Sales)
- View and manage orders
- Receive email notifications for new orders

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (File uploads)
- Nodemailer (Email notifications)
- Stripe (Payment processing)

### Frontend
- React.js
- React Router
- Axios
- Stripe React Components
- Custom CSS with rustic wooden theme

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Stripe account (for payments)
- Email account (Gmail recommended for Nodemailer)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sivahoneyform
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
ADMIN_EMAIL=admin@sivahoneyform.com

# Stripe Payment
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

4. Create uploads directory:
```bash
mkdir uploads
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

4. Start the frontend development server:
```bash
npm start
```

### Running Both Servers

From the root directory:
```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000) servers concurrently.

## Creating Admin User

To create an admin user, you can use MongoDB directly or create a script:

1. Register a user through the frontend
2. Update the user in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Project Structure

```
sivahoneyfarmconsultancyproject/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── payment.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── emailService.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user/admin
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Admin
- `POST /api/admin/products` - Add product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/orders` - Get all orders

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove item from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order

### Payment
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/verify` - Verify payment

## UI Design

The application follows a rustic, natural design theme with:
- Wooden texture backgrounds
- Brown and green color scheme
- Elegant typography (Playfair Display for headings, Poppins for body)
- Responsive design for mobile and desktop

## Payment Integration

The application supports multiple payment methods:
- **Stripe**: Credit/Debit cards (fully integrated)
- **PayPal**: Ready for integration (backend structure in place)

## Email Notifications

When a new order is placed, the admin receives an email notification with:
- Order details
- Customer information
- Shipping information
- Order items and totals

## License

This project is for educational purposes.

## Support

For issues or questions, please contact the development team.
