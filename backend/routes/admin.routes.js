import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
    // Dashboard
    getDashboardStats,
    getSystemStats,

    // User Management
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserBlock,

    // Property Management
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,

    // Admin Profile
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword
} from '../controllers/admin.controller.js';

const adminRouter = express.Router();

// All admin routes require authentication and admin role
adminRouter.use(protect, authorize('admin'));

// ============================================
// DASHBOARD
// ============================================
adminRouter.get('/dashboard', getDashboardStats);
adminRouter.get('/stats', getSystemStats);

// ============================================
// ADMIN PROFILE
// ============================================
adminRouter.get('/profile', getAdminProfile);
adminRouter.put('/profile', updateAdminProfile);
adminRouter.post('/profile/password', changeAdminPassword);

// ============================================
// USER MANAGEMENT
// ============================================
adminRouter.get('/users', getAllUsers);
adminRouter.get('/users/:id', getUserById);
adminRouter.post('/users', createUser);
adminRouter.put('/users/:id', updateUser);
adminRouter.delete('/users/:id', deleteUser);
adminRouter.patch('/users/:id/block', toggleUserBlock);

// ============================================
// PROPERTY MANAGEMENT
// ============================================
adminRouter.get('/properties', getAllProperties);
adminRouter.get('/properties/:id', getPropertyById);
adminRouter.put('/properties/:id', updateProperty);
adminRouter.delete('/properties/:id', deleteProperty);
adminRouter.patch('/properties/:id/status', updatePropertyStatus);

export default adminRouter;