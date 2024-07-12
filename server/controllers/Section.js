const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");


// create a new section
exports.createSection = async (req, res) => {
    try {
        // extract the required properties from the request body
        const { sectionName, courseId } = req.body;

        // validate the input
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing required properties",
            });
        }

        // create a new section with the given name
        const newSection = await Section.create({ sectionName });

        // add the new section to the course's content array
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            { new: true }
        )
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        // Return the updated course object in the response
        res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourse,
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};