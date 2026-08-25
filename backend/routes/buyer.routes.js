import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
    getProperties,
    getPropertyDetails,
    toggleFavorite,
    getFavorites,
    getRecentlyViewed
} from '../controllers/buyer.controller.js';

const buyerRouter = express.Router();

// Public routes (no authentication required)
buyerRouter.get('/properties', getProperties);
buyerRouter.get('/properties/:id', getPropertyDetails);

// Protected routes (authentication required)
buyerRouter.use(protect);
buyerRouter.post('/favorites/:id', toggleFavorite);
buyerRouter.get('/favorites', getFavorites);
buyerRouter.get('/recently-viewed', getRecentlyViewed);

export default buyerRouter;