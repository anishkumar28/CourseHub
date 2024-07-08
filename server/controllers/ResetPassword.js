const User = require("../models/User");
const mailSender = require("../utils/mailSender");


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
            message: "Something went wrong while resetting your password"
        });
    }
}


// resetPassword

