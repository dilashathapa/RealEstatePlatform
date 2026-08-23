import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
    getAgentDashboard,
    addProperty,
    getMyProperties,
    updateProperty,
    deleteProperty
} from '../controllers/agent.controller.js';

const agentRouter = express.Router();

// All routes require authentication and seller role
agentRouter.use(protect, authorize('seller'));

agentRouter.get('/dashboard', getAgentDashboard);
agentRouter.post('/properties', addProperty);
agentRouter.get('/properties', getMyProperties);
agentRouter.put('/properties/:id', updateProperty);
agentRouter.delete('/properties/:id', deleteProperty);

export default agentRouter;