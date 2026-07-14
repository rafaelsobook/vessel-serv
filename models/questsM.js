const { Schema, model } = require("mongoose");

const questSchema = new Schema({
    questId: String,
    qName: String,
    qTtle: String, 
    desc: String, 
    questRequirements: { reqType: String, name: String, current: Number, requiredNum: Number, completed: Boolean }, //reqType'enemy/item/money
    reward: { receiveRewardType: String, rewardItems: {type: Array, default: []}, rewardCoin: Number},
    rankPoints: Number, // this is for your rank to be promoted you must reach 100 points
    requiredRank: String
})
// IN REWARD TYPE IT CAN BE. money || item || both if "both" then you can have money and an Item
module.exports = questModel = model("quests", questSchema)
