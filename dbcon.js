const mongoose = require("mongoose")
require("dotenv").config()


module.exports = dbcon = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(error => console.error("MongoDB connection error:", error))
}