import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import {
    getAgentDashboard,
    addProperty,
    getMyProperties,
    getMyProperty,
    updateMyProperty,
    deleteMyProperty,
    updatePropertyStatus,
    getAgentProfile,
    updateAgentProfile
} from '../controllers/agent.controller.js';

const agentRouter = express.Router();

// All routes require authentication and seller role
agentRouter.use(protect, authorize('seller'));

// Dashboard
agentRouter.get('/dashboard', getAgentDashboard);

// Profile
agentRouter.get('/profile', getAgentProfile);
agentRouter.put('/profile', updateAgentProfile);

// Property Management
agentRouter.post('/properties', upload.array('images', 5), addProperty);
agentRouter.get('/properties', getMyProperties);
agentRouter.get('/properties/:id', getMyProperty);
agentRouter.put('/properties/:id', upload.array('images', 5), updateMyProperty);
agentRouter.delete('/properties/:id', deleteMyProperty);
agentRouter.patch('/properties/:id/status', updatePropertyStatus);

export default agentRouter;