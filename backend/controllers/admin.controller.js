import User from '../models/user.model.js';
import Property from '../models/property.model.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// ============================================
// DASHBOARD
// ============================================

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Admin only
 */
export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalBuyers,
            totalSellers,
            totalProperties,
            pendingProperties,
            approvedProperties,
            rejectedProperties,
            activeProperties,
            totalBlockedUsers,
            recentBuyers,
            recentSellers,
            recentProperties
        ] = await Promise.all([
            User.countDocuments({ role: 'buyer' }),
            User.countDocuments({ role: 'seller' }),
            Property.countDocuments(),
            Property.countDocuments({ status: 'Pending' }),
            Property.countDocuments({ status: 'Approved' }),
            Property.countDocuments({ status: 'Rejected' }),
            Property.countDocuments({ status: 'Active' }),
            User.countDocuments({ isBlocked: true }),
            User.find({ role: 'buyer' })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire'),
            User.find({ role: 'seller' })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire'),
            Property.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('agent', 'name email phone')
                .lean()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalBuyers,
                totalSellers,
                totalUsers: totalBuyers + totalSellers,
                totalProperties,
                pendingProperties,
                approvedProperties,
                rejectedProperties,
                activeProperties,
                totalBlockedUsers,
                recentBuyers,
                recentSellers,
                recentProperties
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
};

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * @desc    Get all users with pagination, search, filtering
 * @route   GET /api/admin/users
 * @access  Admin only
 */
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const role = req.query.role || '';
        const isBlocked = req.query.isBlocked;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const filter = {};

        if (role) {
            filter.role = role;
        }

        if (isBlocked !== undefined && isBlocked !== '') {
            filter.isBlocked = isBlocked === 'true';
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(filter)
        ]);

        // Get property count for sellers
        const sellerIds = users.filter(u => u.role === 'seller').map(u => u._id);
        let propertyCounts = {};
        if (sellerIds.length > 0) {
            const counts = await Property.aggregate([
                { $match: { agent: { $in: sellerIds } } },
                { $group: { _id: '$agent', count: { $sum: 1 } } }
            ]);
            counts.forEach(c => {
                propertyCounts[c._id.toString()] = c.count;
            });
        }

        const usersWithCounts = users.map(user => ({
            ...user,
            propertyCount: propertyCounts[user._id.toString()] || 0
        }));

        res.status(200).json({
            success: true,
            data: {
                users: usersWithCounts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/admin/users/:id
 * @access  Admin only
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(id)
            .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
};

/**
 * @desc    Create a new user
 * @route   POST /api/admin/users
 * @access  Admin only
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, phone, role = 'buyer' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        if (!['buyer', 'seller', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be buyer, seller, or admin'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || '',
            role,
            isVerified: true, // Admin-created users are auto-verified
            isApproved: role === 'seller' ? true : true // Admin approves
        });

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;
        delete userResponse.resetPasswordToken;
        delete userResponse.resetPasswordExpire;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
};

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Admin only
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, isVerified, isApproved } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent updating admin account through this endpoint
        if (user.role === 'admin' && req.user.id !== id) {
            return res.status(403).json({
                success: false,
                message: 'Cannot update other admin accounts'
            });
        }

        // Check email uniqueness
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: id } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (role && ['buyer', 'seller', 'admin'].includes(role)) {
            user.role = role;
        }
        if (isVerified !== undefined) user.isVerified = isVerified;
        if (isApproved !== undefined) user.isApproved = isApproved;

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;
        delete userResponse.resetPasswordToken;
        delete userResponse.resetPasswordExpire;

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin only
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin account'
            });
        }

        if (req.user.id === id) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Delete all properties if seller
        if (user.role === 'seller') {
            await Property.deleteMany({ agent: id });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};

/**
 * @desc    Block/Unblock user
 * @route   PATCH /api/admin/users/:id/block
 * @access  Admin only
 */
export const toggleUserBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBlocked } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        if (isBlocked === undefined) {
            return res.status(400).json({
                success: false,
                message: 'isBlocked field is required'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot block admin account'
            });
        }

        if (req.user.id === id && isBlocked === true) {
            return res.status(403).json({
                success: false,
                message: 'Cannot block your own account'
            });
        }

        user.isBlocked = isBlocked;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
            data: {
                id: user._id,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        console.error('Toggle user block error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
};

// ============================================
// PROPERTY MANAGEMENT
// ============================================

/**
 * @desc    Get all properties with pagination, search, filtering
 * @route   GET /api/admin/properties
 * @access  Admin only
 */
export const getAllProperties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const status = req.query.status || '';
        const propertyType = req.query.propertyType || '';
        const listingType = req.query.listingType || '';
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const city = req.query.city || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const filter = {};

        if (status) {
            filter.status = status;
        }
        if (propertyType) {
            filter.propertyType = propertyType;
        }
        if (listingType) {
            filter.listingType = listingType;
        }
        if (city) {
            filter['location.city'] = { $regex: city, $options: 'i' };
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.address': { $regex: search, $options: 'i' } }
            ];
        }

        const [properties, total] = await Promise.all([
            Property.find(filter)
                .populate('agent', 'name email phone profilePic')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            Property.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                properties,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties'
        });
    }
};

/**
 * @desc    Get single property by ID
 * @route   GET /api/admin/properties/:id
 * @access  Admin only
 */
export const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const property = await Property.findById(id)
            .populate('agent', 'name email phone profilePic')
            .populate('approvalDetails.approvedBy', 'name email')
            .lean();

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.status(200).json({
            success: true,
            data: property
        });
    } catch (error) {
        console.error('Get property by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property'
        });
    }
};

/**
 * @desc    Update property
 * @route   PUT /api/admin/properties/:id
 * @access  Admin only
 */
export const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Allowed fields to update
        const allowedUpdates = [
            'title', 'description', 'propertyType', 'listingType',
            'price', 'location', 'area', 'areaUnit', 'bedrooms',
            'bathrooms', 'amenities', 'status', 'isActive',
            'featured', 'availableFrom', 'yearBuilt', 'parkingSpaces',
            'furnished'
        ];

        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                property[field] = updateData[field];
            }
        });

        await property.save();

        const updatedProperty = await Property.findById(id)
            .populate('agent', 'name email phone')
            .lean();

        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: updatedProperty
        });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update property'
        });
    }
};

/**
 * @desc    Delete property
 * @route   DELETE /api/admin/properties/:id
 * @access  Admin only
 */
export const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        await property.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete property'
        });
    }
};

/**
 * @desc    Update property status (Approve/Reject/Active)
 * @route   PATCH /api/admin/properties/:id/status
 * @access  Admin only
 */
export const updatePropertyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectedReason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Active', 'Sold', 'Rented'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        property.status = status;

        // Track approval details
        if (status === 'Approved' || status === 'Active') {
            property.approvalDetails = {
                approvedBy: req.user.id,
                approvedAt: new Date(),
                rejectedReason: undefined
            };
        } else if (status === 'Rejected') {
            property.approvalDetails = {
                ...property.approvalDetails,
                rejectedReason: rejectedReason || 'Property rejected by admin'
            };
        }

        await property.save();

        const updatedProperty = await Property.findById(id)
            .populate('agent', 'name email phone')
            .populate('approvalDetails.approvedBy', 'name email')
            .lean();

        res.status(200).json({
            success: true,
            message: `Property status updated to ${status}`,
            data: updatedProperty
        });
    } catch (error) {
        console.error('Update property status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update property status'
        });
    }
};

// ============================================
// ADMIN PROFILE MANAGEMENT
// ============================================

/**
 * @desc    Get admin profile
 * @route   GET /api/admin/profile
 * @access  Admin only
 */
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user.id)
            .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
            .lean();

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin profile'
        });
    }
};

/**
 * @desc    Update admin profile
 * @route   PUT /api/admin/profile
 * @access  Admin only
 */
export const updateAdminProfile = async (req, res) => {
    try {
        const { name, email, phone, address, profilePic } = req.body;

        const admin = await User.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (email && email !== admin.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        if (name) admin.name = name;
        if (email) admin.email = email;
        if (phone !== undefined) admin.phone = phone;
        if (address !== undefined) admin.address = address;
        if (profilePic !== undefined) admin.profilePic = profilePic;

        await admin.save();

        const adminResponse = admin.toObject();
        delete adminResponse.password;
        delete adminResponse.verificationToken;
        delete adminResponse.resetPasswordToken;
        delete adminResponse.resetPasswordExpire;

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: adminResponse
        });
    } catch (error) {
        console.error('Update admin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update admin profile'
        });
    }
};

/**
 * @desc    Change admin password
 * @route   POST /api/admin/profile/password
 * @access  Admin only
 */
export const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const admin = await User.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change admin password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

// ============================================
// SYSTEM STATS (Additional)
// ============================================

/**
 * @desc    Get system statistics
 * @route   GET /api/admin/stats
 * @access  Admin only
 */
export const getSystemStats = async (req, res) => {
    try {
        const [
            totalBuyers,
            totalSellers,
            totalProperties,
            totalSales,
            totalRentals,
            featuredProperties
        ] = await Promise.all([
            User.countDocuments({ role: 'buyer' }),
            User.countDocuments({ role: 'seller' }),
            Property.countDocuments(),
            Property.countDocuments({ listingType: 'Sale', status: 'Active' }),
            Property.countDocuments({ listingType: 'Rent', status: 'Active' }),
            Property.countDocuments({ featured: true })
        ]);

        // Price statistics
        const priceStats = await Property.aggregate([
            { $match: { status: 'Active' } },
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        // Properties by type
        const propertiesByType = await Property.aggregate([
            { $group: { _id: '$propertyType', count: { $sum: 1 } } }
        ]);

        // Properties by city
        const propertiesByCity = await Property.aggregate([
            { $group: { _id: '$location.city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: {
                    totalBuyers,
                    totalSellers,
                    total: totalBuyers + totalSellers
                },
                properties: {
                    total: totalProperties,
                    forSale: totalSales,
                    forRent: totalRentals,
                    featured: featuredProperties,
                    priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
                },
                distribution: {
                    byType: propertiesByType,
                    byCity: propertiesByCity
                }
            }
        });
    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system statistics'
        });
    }
};