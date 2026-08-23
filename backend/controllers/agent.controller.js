import Property from '../models/property.model.js';
import User from '../models/user.model.js';

// Get agent dashboard
export const getAgentDashboard = async (req, res) => {
    try {
        const agentId = req.user.id;
        
        const [totalProperties, pendingProperties, approvedProperties, recentProperties] = await Promise.all([
            Property.countDocuments({ agent: agentId }),
            Property.countDocuments({ agent: agentId, status: 'Pending' }),
            Property.countDocuments({ agent: agentId, status: 'Approved' }),
            Property.find({ agent: agentId })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalProperties,
                pendingProperties,
                approvedProperties,
                recentProperties
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard'
        });
    }
};

// Add property
export const addProperty = async (req, res) => {
    try {
        const propertyData = {
            ...req.body,
            agent: req.user.id,
            status: 'Pending' // Requires admin approval
        };
        
        const property = await Property.create(propertyData);
        
        res.status(201).json({
            success: true,
            message: 'Property added successfully. Waiting for admin approval.',
            data: property
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add property'
        });
    }
};

// Get my properties
export const getMyProperties = async (req, res) => {
    try {
        const properties = await Property.find({ agent: req.user.id })
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

// Update property
export const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findOne({ _id: id, agent: req.user.id });
        
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found or unauthorized'
            });
        }
        
        const updated = await Property.findByIdAndUpdate(id, req.body, { new: true });
        
        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update property'
        });
    }
};

// Delete property
export const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findOne({ _id: id, agent: req.user.id });
        
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found or unauthorized'
            });
        }
        
        await property.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete property'
        });
    }
};