# Pet Adoption Platform

A full-stack web application that connects pet owners with potential adopters, built with Node.js, Express, and MongoDB.

## 🌟 Features

- **User Authentication**
  - Secure signup and login functionality
  - Password encryption using bcrypt
  - Role-based access control (Admin/User)

- **Pet Management**
  - Create and manage pet profiles
  - Upload pet images
  - Detailed pet information including behavior and history
  - Browse available pets with filtering options

- **Communication**
  - Built-in contact system between adopters and pet owners
  - Message tracking and storage
  - Real-time confirmation notifications

- **Admin Dashboard**
  - Moderate pet listings
  - Manage user accounts
  - Overview of platform activity

## 🛠️ Technical Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT, bcrypt
- **File Upload:** Multer
- **Frontend:** EJS/HTML, CSS, JavaScript

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## ⚙️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pet-adoption-platform.git
   cd pet-adoption-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/pet-adoption
   JWT_SECRET=your_jwt_secret
   ```

4. Start the application:
   ```bash
   npm start
   ```

## 🗺️ API Routes

### Authentication Routes
```
POST /auth/signup - Register a new user
POST /auth/login  - Login user
GET  /auth/logout - Logout user
```

### Pet Routes
```
GET    /pets          - Get all pets (with optional filters)
GET    /pets/:id      - Get specific pet details
POST   /pets          - Create new pet listing
PUT    /pets/:id      - Update pet listing
DELETE /pets/:id      - Delete pet listing
```

### User Routes
```
GET    /users/profile     - Get user profile
PUT    /users/profile     - Update user profile
POST   /users/contact     - Send message to pet owner
GET    /users/messages    - Get user messages
```

### Admin Routes
```
GET    /admin/dashboard   - Admin dashboard
GET    /admin/users      - Manage users
GET    /admin/pets       - Manage pet listings
DELETE /admin/users/:id  - Delete user
DELETE /admin/pets/:id   - Delete pet listing
```

## 📁 Project Structure

```
Adoption-Center/
├── config/
│   └── db.js
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── contactController.js
│   └── petController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── Message.js
│   ├── Pet.js
│   └── User.js
├── public/
│   ├── css/
│   │   ├── admin.css
│   │   ├── browse.css
│   │   ├── contact.css
│   │   ├── home.css
│   │   ├── login.css
│   │   ├── profile.css
│   │   ├── styles.css
│   │   └── surrender.css
│   └── js/
│       └── hamburger.js
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── contactRoutes.js
│   └── petRoutes.js
├── views/
│   ├── auth/
│   │   ├── login.ejs
│   │   └── signup.ejs
│   ├── layouts/
│   │   └── main.ejs
│   ├── pets/
│   │   ├── browse.ejs
│   │   ├── details.ejs
│   │   └── surrender.ejs
│   ├── admin.ejs
│   ├── contact.ejs
│   ├── home.ejs
│   └── profile.ejs
├── .env
├── .gitignore
├── app.js
├── package.json
├── package-lock.json
└── README.md
```

## 🔒 Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Input validation and sanitization
- Protected routes with middleware
- Role-based access control

## 💻 Development

To run the application in development mode with nodemon:

```bash
npm run dev
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👥 Authors

- Your Name - *Initial work* - [YourGithub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc