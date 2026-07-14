const { Schema, model } = require("mongoose");

const gateSchema = new Schema({
    _id: String,
    pos: Object,
    currentPlace: String,
    placeDetail: Object
})
// IN REWARD TYPE IT CAN BE. money || item || both if "both" then you can have money and an Item
module.exports = gatesModel = model("gates", gateSchema)
