import Property from '../models/property.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// ============================================
// AGENT DASHBOARD
// ============================================

export const getAgentDashboard = async (req, res) => {
    try {
        const agentId = req.user.id;
        
        const totalProperties = await Property.countDocuments({ agent: agentId });
        const pendingProperties = await Property.countDocuments({ agent: agentId, status: 'Pending' });
        const approvedProperties = await Property.countDocuments({ agent: agentId, status: 'Approved' });
        const rejectedProperties = await Property.countDocuments({ agent: agentId, status: 'Rejected' });
        const activeProperties = await Property.countDocuments({ agent: agentId, status: 'Active' });
        
        const recentProperties = await Property.find({ agent: agentId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.status(200).json({
            success: true,
            data: {
                totalProperties,
                pendingProperties,
                approvedProperties,
                rejectedProperties,
                activeProperties,
                totalViews: 0,
                recentProperties
            }
        });
    } catch (error) {
        console.error('❌ Agent dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard'
        });
    }
};

// ============================================
// PROPERTY MANAGEMENT
// ============================================

export const addProperty = async (req, res) => {
    try {
        console.log('📦 Received property data:', req.body);
        console.log('📸 Files:', req.files);

        const {
            title,
            description,
            propertyType,
            listingType,
            price,
            location,
            area,
            areaUnit,
            bedrooms,
            bathrooms,
            amenities,
            yearBuilt,
            parkingSpaces,
            furnished,
            availableFrom
        } = req.body;

        // Validate required fields
        if (!title || !description || !propertyType || !listingType || !price || !area) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Parse location if it's a string
        let parsedLocation = location;
        if (typeof location === 'string') {
            try {
                parsedLocation = JSON.parse(location);
            } catch (e) {
                parsedLocation = { address: location, city: 'Unknown' };
            }
        }

        // Handle images
        let images = [];
        let mainImage = '';
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/uploads/${file.filename}`);
            mainImage = images[0];
        }

        const propertyData = {
            title,
            description,
            propertyType,
            listingType,
            price: parseFloat(price),
            location: parsedLocation || { address: '', city: '' },
            area: parseFloat(area),
            areaUnit: areaUnit || 'sqft',
            bedrooms: parseInt(bedrooms) || 0,
            bathrooms: parseInt(bathrooms) || 0,
            amenities: amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : [],
            images,
            mainImage,
            yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
            parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : 0,
            furnished: furnished === 'true' || furnished === true,
            availableFrom: availableFrom || new Date(),
            agent: req.user.id,
            status: 'Pending'
        };

        const property = await Property.create(propertyData);

        const populatedProperty = await Property.findById(property._id)
            .populate('agent', 'name email phone');

        res.status(201).json({
            success: true,
            message: 'Property added successfully! Waiting for admin approval.',
            data: populatedProperty
        });
    } catch (error) {
        console.error('❌ Add property error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add property'
        });
    }
};

// ============================================
// GET MY PROPERTIES - SIMPLIFIED & FIXED
// ============================================

export const getMyProperties = async (req, res) => {
    try {
        console.log('🔍 Fetching properties for agent:', req.user.id);
        console.log('🔑 User role:', req.user.role);

        const agentId = req.user.id;
        
        // Simple query without pagination first to test
        const properties = await Property.find({ agent: agentId })
            .sort({ createdAt: -1 })
            .lean();

        console.log('✅ Found properties:', properties.length);

        res.status(200).json({
            success: true,
            data: {
                properties: properties,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: properties.length,
                    pages: 1
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
// GET SINGLE PROPERTY
// ============================================

export const getMyProperty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const property = await Property.findOne({ _id: id, agent: req.user.id })
            .populate('agent', 'name email phone');

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
        console.error('❌ Get property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property'
        });
    }
};

// ============================================
// UPDATE PROPERTY
// ============================================

export const updateMyProperty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const property = await Property.findOne({ _id: id, agent: req.user.id });
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        const {
            title,
            description,
            propertyType,
            listingType,
            price,
            location,
            area,
            areaUnit,
            bedrooms,
            bathrooms,
            amenities
        } = req.body;

        if (title) property.title = title;
        if (description) property.description = description;
        if (propertyType) property.propertyType = propertyType;
        if (listingType) property.listingType = listingType;
        if (price) property.price = parseFloat(price);
        if (location) property.location = typeof location === 'string' ? JSON.parse(location) : location;
        if (area) property.area = parseFloat(area);
        if (areaUnit) property.areaUnit = areaUnit;
        if (bedrooms !== undefined) property.bedrooms = parseInt(bedrooms);
        if (bathrooms !== undefined) property.bathrooms = parseInt(bathrooms);
        if (amenities) property.amenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/${file.filename}`);
            property.images = [...property.images, ...newImages];
            if (!property.mainImage) {
                property.mainImage = property.images[0];
            }
        }

        await property.save();

        const updatedProperty = await Property.findById(id)
            .populate('agent', 'name email phone');

        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: updatedProperty
        });
    } catch (error) {
        console.error('❌ Update property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update property'
        });
    }
};

// ============================================
// DELETE PROPERTY
// ============================================

export const deleteMyProperty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const property = await Property.findOne({ _id: id, agent: req.user.id });
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
        console.error('❌ Delete property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete property'
        });
    }
};

// ============================================
// UPDATE PROPERTY STATUS
// ============================================

export const updatePropertyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const property = await Property.findOne({ _id: id, agent: req.user.id });
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        const validStatuses = ['Active', 'Inactive'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        property.status = status;
        await property.save();

        res.status(200).json({
            success: true,
            message: `Property ${status === 'Active' ? 'activated' : 'deactivated'} successfully`,
            data: property
        });
    } catch (error) {
        console.error('❌ Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update property status'
        });
    }
};

// ============================================
// AGENT PROFILE
// ============================================

export const getAgentProfile = async (req, res) => {
    try {
        const agent = await User.findById(req.user.id)
            .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire');

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        res.status(200).json({
            success: true,
            data: agent
        });
    } catch (error) {
        console.error('❌ Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

export const updateAgentProfile = async (req, res) => {
    try {
        const { name, phone, address, profilePic } = req.body;

        const agent = await User.findById(req.user.id);
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        if (name) agent.name = name;
        if (phone !== undefined) agent.phone = phone;
        if (address !== undefined) agent.address = address;
        if (profilePic !== undefined) agent.profilePic = profilePic;

        await agent.save();

        const agentResponse = agent.toObject();
        delete agentResponse.password;
        delete agentResponse.verificationToken;
        delete agentResponse.resetPasswordToken;
        delete agentResponse.resetPasswordExpire;

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: agentResponse
        });
    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};