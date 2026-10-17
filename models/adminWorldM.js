const { Schema, model } = require("mongoose")

// What the tcp server's master control keeps between restarts (tcp/admin/
// persistence.ts): one document per environment - "production", "dev" - holding
// the enemies, chests, grains and mushrooms an admin chose to keep. tcp has no
// database of its own, so this is where it lives.
const adminWorldSchema = new Schema({
    name: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true, minimize: false })

module.exports = model("AdminWorld", adminWorldSchema)
