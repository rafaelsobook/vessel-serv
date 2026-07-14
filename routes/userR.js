const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Users = require("../models/userM.js")

function auth(req,res, next){
    try {
        const token = req.headers.authori.split(" ")[1]

        const decodedData = jwt.verify(token, process.env.JWT_SEC)

        req.userId = decodedData.id
        next()
    } catch (error) {
        return res.json('did not pass authentication')
    }
}
router.get("/", auth, async (req, res) => {
    try {
        const allusers = await Users.find()
        res.send(allusers)
    } catch (error) {
        res.send(error).status(400)
    }
})

router.post("/register", async (req, res) => {
    const { username, password } = req.body

    try {
        const Uzer = await Users.findOne({username: username})
        if(Uzer) return res.json("Username Exist").status(400)

        const pass = await bcrypt.hash(password, 10)

        const newUser = new Users({username, password: pass})

        await newUser.save()

        const token = jwt.sign({id: newUser._id}, process.env.JWT_SEC)

        res.json({token, details: newUser})

    } catch (error) {
        res.send(error).status(400)
    }
})

router.post("/login", async (req, res) => {
    const {username, password} = req.body
    console.log(req.body)
    const validPerson = await Users.findOne({username})
    if(!validPerson) return res.json("norecord")

    const isPassValid = await bcrypt.compare(password, validPerson.password)
    if(!isPassValid) return res.json("norecord")

    const token = jwt.sign({id: validPerson._id}, process.env.JWT_SEC)

    res.json({token, details: validPerson}).status(200)
})

router.get("/:id", auth, async (req, res) => {
   
    const validPerson = await Users.findById(req.params.id)
    if(!validPerson) return res.json("norecord")

    const token = jwt.sign({id: validPerson._id}, process.env.JWT_SEC)

    res.json({token, details: validPerson}).status(200)
})

router.patch("/:id", async (req,res) => {

    try {
        const updatedUzer = await Users.findByIdAndUpdate(req.params.id, req.body, {new: true})

        res.send(updatedUzer)
    } catch (error) {
        res.send(error).status(400)
    }
})


// update haveBot to false after bot destroyed !
router.patch("/botdestroyed/:id", async (req,res) => {

    // try {
    //     const updatedUzer = await Users.findByIdAndUpdate(req.params.id,{haveBot: false}, {new: true})

    //     res.send(updatedUzer)
    // } catch (error) {
    //     res.send(error).status(400)
    //     log(error)
    // }
})

module.exports = router