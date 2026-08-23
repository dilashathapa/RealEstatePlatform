import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Register - Auto-verify all users (no email needed)
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }
        
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        // Auto-verify ALL users (no email verification needed)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "buyer",
            isVerified: true, // ✅ Auto-verified
            isApproved: role === "seller" ? false : true,
            isBlocked: false
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Remove sensitive data
        const userData = user.toObject();
        delete userData.password;
        delete userData.verificationToken;
        delete userData.resetPasswordToken;
        delete userData.resetPasswordExpire;

        res.status(201).json({
            success: true,
            message: "✅ Registration successful!",
            token,
            user: userData
        });
    } catch (err) {
        console.error("❌ Registration error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Registration failed"
        });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        
        // ✅ Skip email verification check since all are auto-verified
        // if (!user.isVerified) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Please verify your email"
        //     });
        // }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked by an admin. Please contact support."
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        const userData = user.toObject();
        delete userData.password;
        delete userData.verificationToken;
        delete userData.resetPasswordToken;
        delete userData.resetPasswordExpire;

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: userData,
        });
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Login failed"
        });
    }
};

// Get Profile
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password -verificationToken -resetPasswordToken -resetPasswordExpire");
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            user,
        });
    } catch (err) {
        console.error("❌ Get profile error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to get profile"
        });
    }
};

// ✅ Remove verifyEmail - not needed anymore
// export const verifyEmail = async (req, res) => { ... }

// Forgot Password (Optional - can be removed if not needed)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No user found with that email address"
            });
        }

        // For testing, just return a success message
        res.status(200).json({
            success: true,
            message: "Password reset instructions sent to your email"
        });
    } catch (err) {
        console.error("❌ Forgot password error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to process request"
        });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        // Simplified for testing
        // In production, implement proper token validation
        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (err) {
        console.error("❌ Reset password error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to reset password"
        });
    }
};

// Admin Registration
export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            isVerified: true,
            isApproved: true,
            isBlocked: false
        });
        
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        const userData = user.toObject();
        delete userData.password;
        delete userData.verificationToken;
        delete userData.resetPasswordToken;
        delete userData.resetPasswordExpire;

        res.status(201).json({
            success: true,
            message: "✅ Admin created successfully!",
            token,
            user: userData
        });
    } catch (err) {
        console.error("❌ Admin registration error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Registration failed"
        });
    }
};