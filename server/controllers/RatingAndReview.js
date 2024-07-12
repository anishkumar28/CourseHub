const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course") 
const mongoose = require("mongoose")
// const { mongo, default: mongoose } = require("mongoose");

//createRating => handler function
exports.createRating = async (req, res) => {
    try{
        //getting.. user-id
        const userId = req.user.id;

        //fetching... data
        const {rating, review, courseId} = req.body;

        //check if user is enrolled 
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentsEnrolled : {$elemMatch : {$eq : userId}},
            },
            );

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled",
            })
        }

        //check if already write review
        const alreadyReviewed = await RatingAndReview.findOne(
            {user: userId,
            course: courseId}
        ); 
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"U have Already reviewed",
            })
        }

        //create ratingReview
        const ratingReview = await RatingAndReview.create({
            rating, review, 
            user: userId,
            course: courseId
        });

        //updating.. course
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id : courseId}, 
            {
                $push:{ratingAndReviews: ratingReview._id}
            },
            {new : true});
        console.log(updatedCourseDetails);

        //return final response...
        return res.status(200).json({
            success:true,
            message:"rating and review added successfully !!",
            ratingReview,
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}