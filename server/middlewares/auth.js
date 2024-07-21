const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");


// auth
exports.auth = async (req, res, next) => {
    try{
        // extract token
        const token = req.cookies.token 
                      || req.body.token 
                      || req.body.header("Authorization").replace("Bearer", "");

       // check for token
       if(!token){
        return res.status(401).json({
            success: false,
            message: "No token, authorization denied",
        });
       }

       // verify the token 
       try{
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        console.log(decode);
        req.user = decode;

       } catch(error){
        return res.status(401).json({
            success: false,
            messaage: 'Invalid token',
        });
       }
       next();
       
    } catch(error){
        return res.status(401).json({
            success: false,
            message: 'Something went wrong',
        });
    }
}



// isStudent
exports.isStudent = async (req,res, next) => {
    try{
       if(req.user.accountType !== "Student"){
        return res.status(401).json({
            success: false,
            message: 'This is a protected route for Student',
        });
       }

       next();

    } catch(error){
        return res.status(500).json({
            success: false,
            message: 'User role not verified',
        });
    }
}


//isInstructor
exports.isInstructor = async (req,res, next) => {
    try{
       if(req.user.accountType !== "Instructor"){
        return res.status(401).json({
            success: false,
            message: 'This is a protected route for Instructor',
        });
       }

       next();
       
    } catch(error){
        return res.status(500).json({
            success: false,
            message: 'User role not verified',
        });
    }
};


// isAdmin
exports.isAdmin = async (req,res, next) => {
    try{
       if(req.user.accountType !== "Admin"){
        return res.status(401).json({
            success: false,
            message: 'This is a protected route for Admin',
        });
       }

       next();
       
    } catch(error){
        return res.status(500).json({
            success: false,
            message: 'User role not verified',
        });
    }
};