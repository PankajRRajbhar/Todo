const jwt = require("jsonwebtoken");
const Users = require("../model/users");

exports. isAuth = async(req, res, next) => {
    try {
        const token = req.headers.authorization;
        if(!token) return next(new Error("Authentication failed."));
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        const isUserexists = await Users.findOne({ email: decodedToken.email });
        if (!isUserexists) return next(new Error("Authentication failed."));
        req.user = isUserexists;
        return next();
    } catch (error) {
        return next(error);
    }
}