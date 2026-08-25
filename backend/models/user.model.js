import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["buyer", "seller", "admin"],
        default: "buyer"
    },
    phone: {
        type: String,
        default: ""
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    profilePic: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    verificationToken: {
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'property'
    }] 
}, {
    timestamps: true
});

const User = mongoose.model("user", userSchema);

export default User;