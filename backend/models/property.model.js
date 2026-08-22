import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    propertyType: {
        type: String,
        enum: ['Apartment', 'House', 'Villa', 'Condo', 'Land', 'Commercial', 'Other'],
        required: true
    },
    listingType: {
        type: String,
        enum: ['Sale', 'Rent'],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'Nepal'
        },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    area: {
        type: Number,
        required: true,
        min: 0
    },
    areaUnit: {
        type: String,
        enum: ['sqft', 'sqm', 'acre', 'hectare'],
        default: 'sqft'
    },
    bedrooms: {
        type: Number,
        default: 0,
        min: 0
    },
    bathrooms: {
        type: Number,
        default: 0,
        min: 0
    },
    amenities: {
        type: [String],
        default: []
    },
    images: {
        type: [String],
        default: []
    },
    mainImage: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Sold', 'Rented'],
        default: 'Pending'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    favorites: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    availableFrom: {
        type: Date,
        default: Date.now
    },
    yearBuilt: {
        type: Number,
        min: 1800,
        max: new Date().getFullYear()
    },
    parkingSpaces: {
        type: Number,
        default: 0
    },
    furnished: {
        type: Boolean,
        default: false
    },
    approvalDetails: {
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        approvedAt: Date,
        rejectedReason: String
    }
}, {
    timestamps: true
});

// Indexes for search performance
propertySchema.index({ title: 'text', description: 'text' });
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ listingType: 1 });

const Property = mongoose.model('property', propertySchema);
export default Property;