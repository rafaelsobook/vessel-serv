const mongoose = require("mongoose")
require("dotenv").config()


module.exports = dbcon = () => {
    if(!process.env.MONGO_URI){
        // deploy platforms (Render, etc.) need MONGO_URI set in their own
        // dashboard env vars, separate from any local .env file - this is a
        // common "works locally, not in prod" gap, so make it loud instead
        // of mongoose failing with a cryptic "undefined" connection error
        console.error("[dbcon] MONGO_URI is not set - check the deploy environment's env vars")
        return
    }

    try {
        mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("connected to db !")
        })
        .catch(error => {
            console.error("[dbcon] error connecting to mongodb:", error?.message ?? error)
        })
    } catch (error) {
        // mongoose.connect can throw synchronously (before returning a
        // promise) for a malformed URI - without this, that would be an
        // uncaught exception crashing the whole process at startup
        console.error("[dbcon] mongoose.connect threw synchronously:", error?.message ?? error)
    }
}