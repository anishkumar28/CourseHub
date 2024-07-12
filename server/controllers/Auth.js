const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// sendOTP
exports.sendOTP = async (req,res ) => {
    try{
        // fetch email from body of request
        const {email} = req.body;

        // check if user already exist 
        const checkUserPresent = await User.findOne({email});

        // if user already exist
        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message: "User already registered",
            });
        }

        // generate otp
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        // check unique otp or not
        const result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        // create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        })
    
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

  

// signup
exports.signup = async (req,res) => {
    try{

        // fetch data from body of request
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;


        // validation
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message: 'Please fill all the fields',
            })
        }


        // match both password
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message: 'Password does not match',
            });
        }

        // check if user already exist or not 
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status|(400).json({
                success: false,
                message: 'User is already registered'
            });
        }

        // find most recent otp 
        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log(recentOtp);

        // validate otp 
        if(recentOtp.length == 0){
            return res.status(400).json({
                success:false,
                message: 'OTP not found',
            })
        } else if(otp !== recentOtp.otp){
            // Invalid OTP
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }


        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        return res.status(200).json({
            success:true,
            message: 'User registered successfully',
            user,
        });


    } catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered. Please try again',
        });
    }
};



// login
exports.login = async (req,res) => {
    try{
        // get the data from body of request
        const {email,password} = req.body;

        // data validation
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message: 'Please provide email and password',
            }); 
        }

        // check if user exist or not 
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message: 'User not found. Please Signup first',
            });
        }

        // generate JWT token 
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;



        // create cookie and send response
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly: true,
        }
        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: 'Login successful',

        });

        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }


    } catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });

    }
};

// changePassword

exports.changePassword = async (req, res) => {
    try{

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }

};