const Course = require("../models/Course");
const Category = require("../models/Category");
const Tag = require("../models/Tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// createCourse handler function
exports.createCourse = async (req,res) => {
    try{

        // data fetching
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields",
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details:", instructorDetails);

        if(!instructorDetails){
            return res.status(400).json({
                success: false,
                message: "Instructor Details not found",
            });
        }

        // check the given tag is valid or not
        const tagDetails = await Tags.findById(tag);
        if(!tagDetails){
            return res.status(400).json({
                success: false,
                message: "Tag Details not found",
            });
        }

        // upload image to Cloudinary 
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create entry to database
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });

        // add the new course to the user schema of instructor 
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true},
        );

         // add the new course to the categories
         const categoryDetails2 = await Category.findByIdAndUpdate(
            { _id: category },
            {
              $push: {
                courses: newCourse._id,
              },
            },
            { new: true }
          );

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
        });

    } catch (error){
        console.error(error);
        return res.status(400).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        });
    }
}