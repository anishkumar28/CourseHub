const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL,)
    .then(() => console.log("Database connected successfully"))
    .catch((error) => {
        console.log("Error connecting to database");
        console.error(error.message);
        process.exit(1);
    })

    };