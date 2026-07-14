const mongoose = require('mongoose')
const {Schema, model} = mongoose;

const userSchema = new Schema({
    username: String,
    password: String,
    isAdmin: { type: Boolean, default: false},
},
    {timestamps: true}
)

module.exports = UzerModel = model("Users", userSchema)