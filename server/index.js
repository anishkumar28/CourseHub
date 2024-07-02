const express = require("express");
const app = express();

require('dotenv').config();
const PORT = process.env.PORT || 4000;

app.use(express.json());

require("./config/database").connect();

// import route
const user = require("./routes/user");

// mount route
app.use("/api/v1",user);

// start server
app.listen(PORT, () => {
    console.log(`Server started suceessfully at ${PORT}`);
})