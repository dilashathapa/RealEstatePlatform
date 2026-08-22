// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Protect middleware - verify JWT token
export const protect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            // FIXED: split(" ") instead of split("")
            token = req.headers.authorization.split(" ")[1];
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing"
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (req.user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked by an admin"
            });
        }
        
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            message: "Token invalid or expired"
        });
    }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access Denied. ${req.user.role} role doesn't have permission.`
            });
        }
        next();
    };
};

// Check if user is admin
export const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};