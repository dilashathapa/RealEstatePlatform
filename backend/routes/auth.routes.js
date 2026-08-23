import { protect } from '../middlewares/auth.middleware.js';
import express from 'express';
import {
    forgotPassword,
    getMe,
    login,
    register,
    registerAdmin,
    resetPassword
} from '../controllers/auth.controller.js';

const authRouter = express.Router();

// Auth routes
authRouter.post("/register", register);
authRouter.post("/register-admin", registerAdmin);
authRouter.post("/login", login);

// Profile
authRouter.get("/me", protect, getMe);

// Password reset (simplified)
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

export default authRouter;