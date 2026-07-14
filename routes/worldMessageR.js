const router = require("express").Router()

const jwt = require("jsonwebtoken")
require("dotenv").config()

const Messages = require("../models/worldMessageM.js")

function auth(req,res, next){
    try {
        const token = req.headers.authori.split(" ")[1]
        const decodedData = jwt.verify(token, process.env.JWT_SEC)

        req.userId = decodedData.id
        next()
    } catch (error) {
        return res.send('did not pass authentication')
    }
}

router.get("/", auth, async (req, res) => {
    try {
        const allmessages = await Messages.find()
        res.json(allmessages)
    } catch (error) {
        res.send(error).status(400)
    }
})

router.post("/save", auth, async (req, res) => {
    try {
        const newMessage = new Messages(req.body)

        await newMessage.save()

        res.json(newMessage)
    } catch (error) {
        res.send(error).status(400)
    }
})


module.exports = router