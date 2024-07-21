const User = require("../models/User");
const {mailSender} = require("../utils/mailSender");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");


// resetPasswordToken
exports.resetPasswordToken = async (req,res) => {
    try{
        // get email from body of request
        const email = req.body.email;

        // find user by email, email validation
        const user = await User.findOne({email: email});
        if(!user) {
            return res.json({
                success: false,
                message: "User not found",
            })
        }

        // generate token 
        const token = crypto.randomUUID();

        // update user by adding token and expiration time
        const updateDetails = await User.findOneAndUpdate({email: email},
            {
                token: token,
                resetPasswordExpires: Date.now() + 5*60*1000,
            },
            {new: true}
        );

        // create url
        const url = `http://localhost:3000/update-password/${token}`;

        // send email with url
        await mailSender(email,
            "Password Reset Link",
            `Password Reset Link: ${url}`);

        // return response
        return res.json({
            success: true,
            message: "Email send successfully, Please check your inbox"
        });
        

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting your password",
        });
    }
}


// resetPassword
exports.resetPassword = async (req, res) => {
    try{
        // fetch data
        const {password, confirmPassword, token} = req.body;

        //valdiation
        if(password != confirmPassword){
            return res.json({
                success: false,
                message: "Password does not match",
            });
        }
        
        // get user details from database using token 
        const userDetails = await User.findOne({token: token});

        // if no entry - invalid token
        if(!userDetails) {
            return res.json({
                success: false,
                message: "Invalid token",
            })
        }

        // check for token expiration time
        if( userDetails.resetPasswordExpires < Date.now() ) {
            return res.json({
                success: false,
                message: "Link expired",
            })

        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // update password
        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true},
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting your password",
        });
    }
}
