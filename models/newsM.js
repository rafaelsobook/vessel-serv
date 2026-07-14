const { Schema, model } = require("mongoose");

const newsSchema = new Schema({
    title: String,
    desc: String,
    newsImg: String
})
// IN REWARD TYPE IT CAN BE. money || item || both if "both" then you can have money and an Item
module.exports = newsModel = model("news", newsSchema)
