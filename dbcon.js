const mongoose = require("mongoose")
require("dotenv").config()


module.exports = dbcon = () => {
    // mongoose.connect(process.env.MONGO_URI)
    // .then( () => {}
    // .catch( error => {}

    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("connected to db !")
    })
    .catch(error => {
        console.log("error conn to mongodb")
    })
}