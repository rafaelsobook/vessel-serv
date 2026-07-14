const { Schema, model } = require("mongoose")


const worldMessageSchema = new Schema({
    playerId: String,
    name: String,
    message: String,
    place: String,
    msgType: String
})

module.exports = worldMessageModel = model("worldMessages", worldMessageSchema)