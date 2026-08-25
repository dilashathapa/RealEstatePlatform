import Property from '../models/property.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// ============================================
// GET PROPERTIES (Public)
// ============================================

export const getProperties = async (req, res) => {
    try {
        console.log('🔍 Fetching properties with filters:', req.query);

        const {
            search,
            propertyType,
            listingType,
            minPrice,
            maxPrice,
            city,
            bedrooms,
            bathrooms,
            minArea,
            maxArea,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 9
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter - only show approved/active properties
        const filter = {
            status: { $in: ['Approved', 'Active'] },
            isActive: true
        };

        // Search in title, description, address
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.address': { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } }
            ];
        }

        // Filters
        if (propertyType) filter.propertyType = propertyType;
        if (listingType) filter.listingType = listingType;
        if (city) filter['location.city'] = { $regex: city, $options: 'i' };
        if (bedrooms) filter.bedrooms = parseInt(bedrooms);
        if (bathrooms) filter.bathrooms = parseInt(bathrooms);

        // Price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Area range
        if (minArea || maxArea) {
            filter.area = {};
            if (minArea) filter.area.$gte = parseFloat(minArea);
            if (maxArea) filter.area.$lte = parseFloat(maxArea);
        }

        // Sorting
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [properties, total] = await Promise.all([
            Property.find(filter)
                .populate('agent', 'name email phone profilePic')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Property.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                properties,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('❌ Get properties error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch properties'
        });
    }
};

// ============================================
// GET PROPERTY DETAILS (Public)
// ============================================

export const getPropertyDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const property = await Property.findOne({
            _id: id,
            status: { $in: ['Approved', 'Active'] },
            isActive: true
        }).populate('agent', 'name email phone profilePic');

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Increment views
        property.views += 1;
        await property.save();

        res.status(200).json({
            success: true,
            data: property
        });
    } catch (error) {
        console.error('❌ Get property details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property details'
        });
    }
};

// ============================================
// TOGGLE FAVORITE (Protected)
// ============================================

export const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

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

        const user = await User.findById(userId);
        if (!user.favorites) {
            user.favorites = [];
        }

        const index = user.favorites.indexOf(id);
        let message;

        if (index > -1) {
            user.favorites.splice(index, 1);
            message = 'Property removed from favorites';
        } else {
            user.favorites.push(id);
            message = 'Property added to favorites';
        }

        await user.save();

        res.status(200).json({
            success: true,
            message,
            data: {
                favorites: user.favorites
            }
        });
    } catch (error) {
        console.error('❌ Toggle favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update favorites'
        });
    }
};

// ============================================
// GET FAVORITES (Protected)
// ============================================

export const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'favorites',
            populate: {
                path: 'agent',
                select: 'name email phone profilePic'
            }
        });

        res.status(200).json({
            success: true,
            data: user.favorites || []
        });
    } catch (error) {
        console.error('❌ Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch favorites'
        });
    }
};

// ============================================
// GET RECENTLY VIEWED (Protected)
// ============================================

export const getRecentlyViewed = async (req, res) => {
    try {
        // Get recently viewed from user's session or cookie
        // For now, return empty array or get from user model if you store it
        res.status(200).json({
            success: true,
            data: []
        });
    } catch (error) {
        console.error('❌ Get recently viewed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recently viewed'
        });
    }
};