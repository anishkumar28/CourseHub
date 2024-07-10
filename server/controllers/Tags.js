const Tag = require("../models/Tags");



exports.createTag = async (req,res) => {
    try{
        // data fetching
        const {name, description} = req.body;

        // data validation
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields",
            });
        }

        // create entry in database
        const tagDetails = await Tag.create|({
            name: name,
            description: description,
        });
        console.log(tagDetails);

        // return response
        return res.status(200).json({
            success: true,
            message: "Tag created successfully",
        });

    } catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};