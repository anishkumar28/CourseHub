const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");


// auth
const auth = async (req, res, next) => {
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

//isInstructor

// isAdmin