const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
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
router.get("/", async (req, res) => {
    try {
        const allusers = await Users.find()
        res.send(allusers)
    } catch (error) {
        res.send(error).status(400)
    }
})

router.post("/register", async (req, res) => {
    const { username, password } = req.body
    console.log(req.body)
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

// GUEST ACCOUNTS - "Play as Guest" on the home page. One click makes a real
// account: a Guest##### username and a random secret as its password. The
// client keeps both on that device (localStorage) and logs back in with the
// ordinary /login, so a guest's hero is still there next visit. /claim gives
// it a username and password of the player's choosing - the same account, so
// the character (owner: the user's _id) stays.
// What the client gets back about a guest - not the password hash
const guestDetails = user => ({ _id: user._id, username: user.username, isGuest: user.isGuest })

// guests are one click, so cap them per address - in memory, so a restart
// resets it, which is fine for a speed bump. The address is the LAST
// x-forwarded-for entry: the one Render's proxy adds, not one a client wrote
const GUESTS_PER_HOUR = 10
const guestsByAddress = new Map()
function tooManyGuests(req){
    const forwarded = req.headers["x-forwarded-for"]?.split(",").pop().trim()
    const address = forwarded || req.ip
    const hourAgo = Date.now() - 3600000
    const recent = (guestsByAddress.get(address) ?? []).filter(t => t > hourAgo)
    if(recent.length >= GUESTS_PER_HOUR) return true
    recent.push(Date.now())
    guestsByAddress.set(address, recent)
    return false
}

router.post("/guest", async (req, res) => {
    try {
        if(tooManyGuests(req)) return res.json("toomanyguests")

        let username = null
        for(let tries = 0; tries < 8 && !username; tries++){
            const name = `Guest${crypto.randomInt(10000, 100000)}`
            if(!await Users.exists({ username: name })) username = name
        }
        if(!username) return res.json("guestfailed")

        const secret = crypto.randomBytes(24).toString("hex")
        const newUser = new Users({ username, password: await bcrypt.hash(secret, 10), isGuest: true })
        await newUser.save()

        const token = jwt.sign({id: newUser._id}, process.env.JWT_SEC)

        res.json({ token, details: guestDetails(newUser), guestSecret: secret })
    } catch (error) {
        console.error("[users/guest]", error?.message ?? error)
        res.json("guestfailed")
    }
})

// a guest (the token's account) picks its own username and password
router.post("/claim", auth, async (req, res) => {
    const { password } = req.body
    const username = typeof req.body.username === "string" ? req.body.username.trim() : ""
    try {
        if(!username || typeof password !== "string" || !password) return res.json("claimfailed")

        const guest = await Users.findById(req.userId)
        if(!guest || !guest.isGuest) return res.json("notguest")
        if(await Users.exists({ username })) return res.json("Username Exist")

        guest.username = username
        guest.password = await bcrypt.hash(password, 10)
        guest.isGuest = false
        await guest.save()

        const token = jwt.sign({id: guest._id}, process.env.JWT_SEC)

        res.json({ token, details: guestDetails(guest) })
    } catch (error) {
        console.error("[users/claim]", error?.message ?? error)
        res.json("claimfailed")
    }
})

router.post("/login", async (req, res) => {
    const {username, password} = req.body
    console.log(req.body)
    try {
        const validPerson = await Users.findOne({username})
        if(!validPerson) return res.json("norecord")

        const isPassValid = await bcrypt.compare(password, validPerson.password)
        if(!isPassValid) return res.json("norecord")

        const token = jwt.sign({id: validPerson._id}, process.env.JWT_SEC)

        res.json({token, details: validPerson}).status(200)
    } catch (error) {
        res.status(400).json("norecord")
    }
})

router.get("/:id", auth, async (req, res) => {
    try {
        const validPerson = await Users.findById(req.params.id)
        if(!validPerson) return res.json("norecord")

        const token = jwt.sign({id: validPerson._id}, process.env.JWT_SEC)

        res.json({token, details: validPerson}).status(200)
    } catch (error) {
        res.status(400).json("norecord")
    }
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