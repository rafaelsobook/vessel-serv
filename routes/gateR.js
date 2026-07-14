const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const gatesModel = require("../models/gatesM.js")

function auth(req,res, next){
    try {
        const token = req.headers.authori.split(" ")[1]

        const decodedData = jwt.verify(token, process.env.JWT_SEC)

        req.userId = decodedData.id
        next()
    } catch (error) {
        return res.json('tokenfailed')
    }
}
router.get("/", async (req, res) => {
    try {
        const allGates = await gatesModel.find()

        res.json(allGates)
    } catch (error) {
        res.send(error).status(400)
    }
})
router.post("/save", async (req, res) => {
// IN HERE YOU MUST FIND THE SENDER TO BE AN ADMIN INORDER TO SAVE SOME QUESTS
    
    try {
        const newGate = new gatesModel(req.body)

        await newGate.save()

        res.json(newGate)

    } catch (error) {
        res.send(error).status(400)
    }
    // example monster quest
    // { 
    //     "questId": "automatically generated",
    //     "questTarget": { "targetName": "goblin", "targetType": "normal" },
    //     "title": "Minotaur Horde", 
    //     "def": "Minotaur of hordes are found on the swamp forest", 
    //     "reward": { "rewardType": "both", "rewardItems": ["spotion", "bigpotion"],
    //     "rewardCoin": 700 }, 
    //     "demandNumber": 5, 
    //     "currentNumber": 0,
    //     "addPoints": 70,
    //     "requiredRank": "2",
    //     "questPicName": "minslayer",
    //     "secKey": "rafadmin"
    // }

    // edibles
    // {
    //     "questId": "automatically generated",
    //     "questTarget": { "targetName": "stam1", "targetType": "edibles" },
    //     "title": "Pick flowe herb", 
    //     "def": "In Short of stamina herbs", 
    //     "reward": { "rewardType": "cash", "rewardItems": [],
    //     "rewardCoin": 100 }, 
    //     "demandNumber": 1, 
    //     "currentNumber": 0,
    //     "addPoints": 10,
    //     "requiredRank": "0",
    //     "questPicName": "",
    //     "secKey": "rafadmin"
    // }
})

router.delete("/delete/:id", async (req,res) => {
    try{
        const theGate = await gatesModel.findById(req.params.id)
        if(!theGate) return res.json({message: "quest not found"})
        await gatesModel.findByIdAndDelete(req.params.id)
        return res.json(await gatesModel.find());
    }catch(err){
        res.json(err).status(400)
    }
})

module.exports = router