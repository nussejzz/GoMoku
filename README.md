# GoMoku

A full-stack user management system with authentication, registration, and profile management features. This project consists of a Spring Boot backend and a React frontend, providing a secure and modern user experience.

## 🚀 Features

### Backend (User Module)
- ✅ User registration with email verification
- ✅ User login with JWT authentication
- ✅ Password reset functionality
- ✅ User profile management
- ✅ Token verification and refresh
- ✅ RSA encryption for secure password transmission
- ✅ BCrypt password hashing
- ✅ Email verification code service
- ✅ RESTful API with Swagger documentation
- ✅ Health monitoring with Spring Boot Actuator

### Frontend
- ✅ User registration page with email verification
- ✅ User login with RSA-encrypted passwords
- ✅ User profile display
- ✅ Token-based authentication
- ✅ Modern UI with Tailwind CSS
- ✅ Responsive design

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Cache**: Redis 5.0+
- **ORM**: MyBatis
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: RSA encryption, BCrypt hashing
- **Documentation**: Swagger/OpenAPI 3
- **Monitoring**: Spring Boot Actuator
- **Email**: Spring Mail (QQ SMTP)

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Encryption**: JSEncrypt (RSA)

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher
- Redis 5.0 or higher
- Node.js 16 or higher
- npm or yarn

## 🚀 Quick Start

### 1. Database Setup

Create the database and tables:

```bash
mysql -u root -p < user-module-backend/src/main/resources/init.sql
```

### 2. Redis Setup

Start Redis using Docker:

```bash
docker run -d -p 6379:6379 redis:5.0.7
```

Or use your local Redis installation.

### 3. Backend Configuration

Update the configuration in `user-module-backend/src/main/resources/application.yaml`:

- **Database**: Configure MySQL connection (default: `localhost:3306/user_db`)
- **Redis**: Configure Redis connection (default: `localhost:6379`)
- **Email** (Optional): Configure QQ email SMTP for verification codes
  - Set `app.mail.verify-switch-off: true` for development mode (codes will be logged instead of sent)

### 4. Start Backend

```bash
cd user-module-backend
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 5. Start Frontend

```bash
cd user-module-frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000` (or the port specified by Vite)

## 📡 API Endpoints

### Authentication
- `GET /api/user/` - API information
- `GET /api/user/public-key` - Get RSA public key for password encryption
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `GET /api/user/verify` - Verify JWT token
- `POST /api/user/reset-password` - Reset password
- `POST /api/user/logout` - User logout

### User Information
- `GET /api/user/user/{userId}` - Get user information by ID

### Email Service
- `POST /api/user/email/send-verification-code` - Send verification code to email

### Monitoring
- `GET /api/user/actuator/health` - Health check
- `GET /api/user/actuator/info` - Application information
- `GET /api/user/actuator/metrics` - Application metrics

### API Documentation
- `GET /api/user/swagger-ui.html` - Swagger UI
- `GET /api/user/v3/api-docs` - OpenAPI JSON

## 📁 Project Structure

```
GoMoku/
├── user-module-backend/          # Spring Boot backend
│   ├── src/main/java/com/user/
│   │   ├── controller/           # REST controllers
│   │   ├── service/              # Business logic
│   │   ├── mapper/               # MyBatis mappers
│   │   ├── entity/               # Entity classes
│   │   ├── vo/                   # Value objects (request/response)
│   │   ├── util/                 # Utility classes
│   │   └── exception/            # Exception handling
│   └── src/main/resources/
│       ├── mapper/                # MyBatis XML mappings
│       ├── application.yaml      # Application configuration
│       └── init.sql              # Database initialization
│
└── user-module-frontend/         # React frontend
    ├── src/
    │   ├── pages/                # Page components
    │   │   ├── Login.tsx         # Login page
    │   │   ├── Register.tsx      # Registration page
    │   │   └── Profile.tsx       # User profile page
    │   ├── services/             # API services
    │   ├── utils/                # Utility functions
    │   ├── types/                # TypeScript types
    │   └── App.tsx               # Main app component
    └── package.json
```

## 🔐 Security Features

- **RSA Encryption**: Passwords are encrypted on the client side before transmission
- **BCrypt Hashing**: Passwords are hashed using BCrypt before storage
- **JWT Tokens**: Secure token-based authentication
- **Email Verification**: Email verification codes for registration and password reset
- **Token Refresh**: Refresh token mechanism for extended sessions

## 🧪 Development

### Backend Development

```bash
cd user-module-backend
mvn clean install
mvn spring-boot:run
```

### Frontend Development

```bash
cd user-module-frontend
npm install
npm run dev
```

### Building for Production

**Backend:**
```bash
cd user-module-backend
mvn clean package
java -jar target/user-module-1.0.0.jar
```

**Frontend:**
```bash
cd user-module-frontend
npm run build
npm run preview
```

## 📝 Configuration

### Backend Configuration

Key configuration files:
- `application.yaml`: Main application configuration
  - Database connection settings
  - Redis connection settings
  - JWT expiration settings
  - Email SMTP configuration
  - Swagger/OpenAPI settings

### Frontend Configuration

The frontend connects to the backend API at `http://localhost:8080/api/user`. Update the API base URL in `src/services/api.ts` if needed.

## 📊 Monitoring

The application includes Spring Boot Actuator for monitoring:

- Health checks: `/api/user/actuator/health`
- Application info: `/api/user/actuator/info`
- Metrics: `/api/user/actuator/metrics`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 📚 Additional Documentation

- [Backend README](user-module-backend/README.md) - Detailed backend documentation
- [Frontend README](user-module-frontend/README.md) - Detailed frontend documentation

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running and the database is created
   - Check database credentials in `application.yaml`

2. **Redis Connection Error**
   - Ensure Redis is running on port 6379
   - Check Redis connection settings in `application.yaml`

3. **Email Not Sending**
   - For development, set `app.mail.verify-switch-off: true` to log codes instead
   - For production, configure QQ email SMTP with proper authorization code

4. **Frontend Cannot Connect to Backend**
   - Ensure backend is running on port 8080
   - Check CORS settings if needed
   - Verify API base URL in frontend configuration

## 📞 Support

For issues and questions, please open an issue on the repository.
