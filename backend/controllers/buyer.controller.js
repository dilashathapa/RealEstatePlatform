import Property from '../models/property.model.js';
import User from '../models/user.model.js';

// Get all properties (for buyers)
export const getAllProperties = async (req, res) => {
    try {
        const { search, propertyType, listingType, minPrice, maxPrice, city } = req.query;
        
        const filter = { status: 'Approved', isActive: true };
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.address': { $regex: search, $options: 'i' } }
            ];
        }
        if (propertyType) filter.propertyType = propertyType;
        if (listingType) filter.listingType = listingType;
        if (city) filter['location.city'] = { $regex: city, $options: 'i' };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        const properties = await Property.find(filter)
            .populate('agent', 'name email phone')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: properties
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties'
        });
    }
};

// Get single property
export const getPropertyDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id)
            .populate('agent', 'name email phone profilePic');
        
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
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property'
        });
    }
};

// Save/Unsave favorite property
export const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const user = await User.findById(userId);
        if (!user.favorites) {
            user.favorites = [];
        }
        
        const index = user.favorites.indexOf(id);
        if (index > -1) {
            user.favorites.splice(index, 1);
            await user.save();
            return res.status(200).json({
                success: true,
                message: 'Property removed from favorites'
            });
        } else {
            user.favorites.push(id);
            await user.save();
            return res.status(200).json({
                success: true,
                message: 'Property added to favorites'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update favorites'
        });
    }
};