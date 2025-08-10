# Backend API Server

A production-ready Node.js backend server built with Express, TypeScript, and MongoDB support for React applications.

## 🚀 Features

- **TypeScript** - Full TypeScript support with strict type checking
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - MongoDB database with Mongoose ODM
- **Security** - Helmet, CORS, rate limiting, and input validation
- **Error Handling** - Centralized error handling with custom error types
- **Logging** - Request logging with Morgan
- **Compression** - Response compression for better performance
- **Health Checks** - Built-in health check endpoint
- **Environment Config** - Environment-based configuration
- **Development Tools** - Hot reload with nodemon, linting with ESLint

## 📋 Prerequisites

- Node.js (>=18.0.0)
- npm (>=8.0.0)
- MongoDB (local or remote)

## 🔧 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/your-app-name
   DB_NAME=your-app-name
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Build and Watch
```bash
npm run build:watch
```

## 📁 Project Structure

```
src/
├── config/         # Configuration files
│   ├── index.ts    # Environment configuration
│   └── database.ts # MongoDB connection
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # Express routes
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Main application file
```

## 🛡️ Security Features

- **Helmet** - Secures Express apps by setting various HTTP headers
- **CORS** - Configurable Cross-Origin Resource Sharing
- **Rate Limiting** - Prevents abuse with configurable rate limits
- **Input Validation** - Mongoose schema validation
- **Error Handling** - Prevents information leakage in production

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### API Base
- `GET /api` - API information
- `GET /api/test` - Test endpoint

### Example User Endpoints (if implemented)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete)

## 🔧 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run build:watch` - Build and watch for changes
- `npm run clean` - Clean build directory
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/your-app-name` |
| `DB_NAME` | Database name | `your-app-name` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `JWT_SECRET` | JWT secret key | Required in production |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🚦 Error Handling

The application uses centralized error handling with custom error types:

```typescript
import { createError } from './middleware/errorHandler';

// Throw a custom error
throw createError('User not found', 404);
```

## 📝 Logging

Request logging is handled by Morgan with different formats for different environments:
- **Development**: Detailed colored output
- **Production**: Combined format suitable for log aggregation

## 🔍 Monitoring

- Health check endpoint at `/health`
- Request logging with Morgan
- Error tracking and logging

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
