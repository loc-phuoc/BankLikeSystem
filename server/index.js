import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { web3 } from './config/blockchain.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import swaggerSpec from './config/swagger.js';

// Import routes
import healthRoutes from './routes/healthRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

const app = express();

// Connect to MongoDB
connectDB()
  .then(() => console.log('MongoDB connection successful'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Add web3 and env to request object for easier access in route handlers
app.use((req, res, next) => {
  req.web3 = web3;
  req.env = env;
  next();
});

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes - all prefixed with '/api'
app.use('/api', healthRoutes);
app.use('/api', tokenRoutes);
app.use('/api', userRoutes);
app.use('/api', transactionRoutes);

// Global error handler
app.use(errorHandler);

// Start the server
app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  console.log(`API Documentation: http://localhost:${env.port}/api-docs`);
  console.log(`MongoDB URI: ${env.mongoURI.split('@').pop()}`);
  console.log(`Bank Owner: ${env.bankOwnerAddress}`);
  console.log(`Bank Contract: ${env.bankAddress}`);
  console.log(`Token Contract: ${env.tokenAddress}`);
});