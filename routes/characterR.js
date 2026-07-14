const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Users = require("../models/userM.js")
const Character = require("../models/charDetM.js")

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
router.get("/", auth, async (req, res) => {
    try {
        res.json(await Character.find())
    } catch (error) {
        res.send(error).status(400)
    }
})
router.get("/:id", auth, async (req, res) => {
    try {
        const charDet = await Character.findOne({owner: req.params.id})

        if(!charDet) return res.json("notfound")

        res.json(charDet)
    } catch (error) {
        res.send(error).status(400)
    }
})
router.post("/save", auth, async (req, res) => {

    try {
        const { owner, name, cloth, pants, hair,hairColor, boots, clothColor, pantsColor, skinColor } = req.body

        const exists = await Character.findOne({ name })
        if (exists) return res.json("exist")

        const newCharacter = new Character({
            owner,
            name,
            hairColor,
            cloth,
            pants,
            hair,
            boots,
            clothColor,
            pantsColor,
            skinColor,
            stats: { weapon: 1, accuracy: 1, critical: 1, dex: 1, strength: 1, magic: 1, spd: 3.4, atkSpd: 0.9 },
            lvl: 1,
            hp: 50, maxHp: 50,
            mp: 100, maxMp: 100,
            sp: 1000, maxSp: 1000,
            defeatedFoes: [
                { foeType: "monster", total: 0 },
                { foeType: "human", total: 0 },
                { foeType: "demon", total: 0 },
                { foeType: "higher demon", total: 0 },
                { foeType: "dragon", total: 0 },
                { foeType: "god", total: 0 },
            ],
            x: 0, y: 1, z: -2,
            items: [],
            skills: [{
                slotNumber: 1,
                equiped: true,
                isActive: false,
                name: "flexaura",
                lvl: 1,
                pointsToClaim: 1,
                pointsForUpgrade: 1,
                element: "normal",
                requireMode: "any",
                skillType: "na",
                animationLoop: false,
                displayName: "Flex aura",
                castDuration: 10,
                returnModeDura: 900,
                skillCoolDown: 2000,
                demand: [{ name: "mp", minCost: 1, cost: 0.3 }],
                effects: { effectType: "buff", dmgPm: 0, plusDmg: 0, chance: 0, bashPower: 0 },
                skillrank: 6,
                upgradePlus: 60,
                desc: "You can conceal and show your aura, best to do when you want someone to easily spot you in certain places. Your aura density depends on your magic force.",
            }],
            titles: [],
            currentPlace: { placeId: 10, name: "room", areaType: "room" },
            prevPlace: { placeId: 0, name: "na", areaType: "na" },
            places: [],
            status: [],
            // regens: { sp: 0, hp: 0, mana: 0 },
            monsSoul: 1,
            coins: 0,
            assets: { krit: 0, fins: 0, dramite: 0 },
            survival: { hunger: 100, sleep: 100 },
            aptitude: generateAptitudes(),
            monsterKilled: 0,
            defeatedMonsters: [],
            blessings: [],
            stories: [],
            quests: [{
                qName: "talk-to-emilia-1",
                qTtle: "Meet The Receptionist",
                desc: "After being found near dead in the woods, A guild member took you to the guild",
                questRequirements: { reqType: false, completed: true },
            }],
            clearedQuests: [],
            race: "human",
            characterType: "player",
            lastSpoken: "none",
        })

        await newCharacter.save()
        res.json(newCharacter)

    } catch (error) {
        res.send(error).status(400)
    }
})
router.patch("/updateloc/:id", auth, async (req,res) => {

    try {
        const {mypos, survival} = req.body
        const characterUpdated = await Character.findByIdAndUpdate(req.params.id, {x: mypos.x, z: mypos.z, survival}, {new: true})

        res.json(characterUpdated)
    } catch (error) {
        res.json(error).status(400)
    }
})
router.patch("/updateplace/:id", auth, async (req,res) => {

    try {
        const ourDetails = await Character.findById(req.params.id)
        if(!ourDetails) return res.json({message: "not found our details"}).status(400)
        const curPlace = req.body.currentPlace
        const hadVisited = ourDetails.places.some(placeName => placeName == curPlace)
        let myPlaces
        if(!hadVisited){
            myPlaces = [...ourDetails.places, curPlace]
        }else{
            myPlaces = ourDetails.places
        }
        const characterUpdated = await Character.findByIdAndUpdate(req.params.id, {currentPlace: req.body.currentPlace, places: myPlaces}, {new: true})

        res.json(characterUpdated)
    } catch (error) {
        res.json(error).status(400)
    }
})
router.patch("/additem/:id", auth, async (req,res) => {

    try {
        const character = await Character.findOne({owner: req.params.id})
        if(!character) return res.json("notfound")
        const cannotDuplicates = ['sword', 'armor', 'shield', 'gear', 'helmet']
        let canDuplicate = true
        cannotDuplicates.forEach(itemName => {
            if(itemName === req.body.itemType) canDuplicate = false            
        })
        
        if(!canDuplicate){
            character.items.push(req.body)
            const theCharac = await Character.findByIdAndUpdate(character._id, character, {new: true})
            return res.json(theCharac)
        }
        const isHave = character.items.some(item => item.name === req.body.name)
        if(isHave){
            character.items.map(item => item.name === req.body.name ? {...item, qnty: item.qnty+=req.body.qnty } : item)
        }else{
            character.items.push(req.body)
        }

        const theCharac = await Character.findByIdAndUpdate(character._id, character, {new: true})
        res.json(theCharac)
    } catch (error) {
        res.json(error).status(400)
    }
})
router.patch("/updateweapon/:id", auth, async (req,res) => {

    try {
        const character = await Character.findById(req.params.id)
        if(!character) return res.json("notfound")

        const theCharac = await Character.findByIdAndUpdate(character._id, {weapon: req.body}, {new: true})

        res.json(theCharac)
    } catch (error) {
        res.json(error).status(400)
    }
})
router.patch("/deductitem/:id", auth, async (req,res) => {
    try {
        let character = await Character.findById(req.params.id)
        if(!character) return
        const theItem = character.items.find(item => item.meshId === req.body.meshId)
        if(!theItem) return

        if(theItem){
            if(theItem.qnty === 1){
                character.items = character.items.filter(item => item.meshId !== req.body.meshId)
            }else{
                character.items = character.items.map(item => item.meshId === req.body.meshId ? {...item, qnty: item.qnty-=req.body.qnty } : item)
                // check again baka naging 0 na pagka bawas

                const updatedItem = character.items.find(item => item.meshId === req.body.meshId)
                if(updatedItem.qnty < 1){
                    character.items = character.items.filter(item => item.meshId !== req.body.meshId)
                }
            }
        }

        const theCharac = await Character.findByIdAndUpdate(req.params.id, character, {new: true})
        
        res.json(theCharac)
    } catch (error) {
        res.json(error).status(400)
    }
})
router.patch("/updateall/:id", auth, async (req,res) => {
    try {
        const character = await Character.findById(req.params.id)
        if(!character) return res.json("notfound").status(400)
        
        const theCharac = await Character.findByIdAndUpdate(req.params.id, req.body, {new: true})

        res.json(theCharac)
    } catch (error) {
        res.json(error).status(400)
    }
})
router.patch("/myquest/add/:id", auth, async (req, res) => {
    try {
        const character = await Character.findById(req.params.id)
        if(!character) return res.json("notfound").status(400)
        character.quests.push(req.body)
        const newQuests = character.quests
        const theCharac = await Character.findByIdAndUpdate(req.params.id, { quests: newQuests}, {new: true})
        res.json(theCharac)
    } catch (error) {
        res.json(error).status(400)
    }
})
// update haveBot to false after bot destroyed !
router.delete("/delete/:id", async (req,res) => {
    try{
        const theChar = await Character.findById(req.params.id)
        if(!theChar) return res.json({message: "not found char"})
        await Character.findByIdAndDelete(req.params.id)
    }catch(err){
        res.json(err).status(400)
    }
    res.json(await Character.find())
})

function generateAptitudes(luckPercentage = 0.3) {
    const elements = [
        { name: 'fire',     weight: 1.0  },
        { name: 'water',    weight: 0.7  },
        { name: 'earth',    weight: 0.5  },
        { name: 'light',    weight: 0.25 },
        { name: 'darkness', weight: 0.15 },
    ]
    return elements
        .filter(el => Math.random() < luckPercentage * el.weight)
        .map(el => ({ element: el.name, level: 1 }))
}

module.exports = router