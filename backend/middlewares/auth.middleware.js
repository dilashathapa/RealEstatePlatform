import jwt from 'jsonwebtoken';
import user from '../models/user.model.js'
import User from '../models/user.model.js';

//protect
export const protect = async (req, res, next) => {
    try {
        let token;
        if(
            req.headers.authorization
            &&
            req.headers.authorization.startsWith("Bearer")
        ){
            token = req.headers.authorization.split("")[1];
        }
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing"
            });
        }
        const  decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if(req.user && req.user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked by an admin"
            })
        }
    } catch (err) {
        res.status(401).json({
            success: false,
            message: "Token invalid"
        });
    }
};
