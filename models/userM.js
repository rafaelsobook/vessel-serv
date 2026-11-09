const mongoose = require('mongoose')
const {Schema, model} = mongoose;

const userSchema = new Schema({
    username: String,
    password: String,
    isAdmin: { type: Boolean, default: false},
    // made by "Play as Guest" (userR.js /guest) - no form, a Guest##### name and
    // a random secret kept on the player's device. /claim turns it into a
    // normal account (their own username/password) and clears this
    isGuest: { type: Boolean, default: false},
},
    {timestamps: true}
)

module.exports = UzerModel = model("Users", userSchema)