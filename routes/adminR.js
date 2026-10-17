const router = require("express").Router()
const crypto = require("crypto")

const Character = require("../models/charDetM.js")
const AdminWorld = require("../models/adminWorldM.js")

// The tcp server's master control (tcp/admin) uses this server for the two
// things that need the database: the placements an admin keeps across restarts,
// and moving a character that isn't online. Every route needs the admin key in
// x-admin-key - the same "rafadmin" the quest routes check - unless ADMIN_KEY is
// set in the environment. Unlike the older routes, a failure here comes back
// with a real status code (tcp is the only caller).
const ADMIN_KEY = process.env.ADMIN_KEY || "rafadmin"
const digest = text => crypto.createHash("sha256").update(String(text)).digest()
const KEY_DIGEST = digest(ADMIN_KEY)

// a few wrong guesses from one address lock it out for a while
const MAX_FAILURES = 5
const LOCK_MS = 10 * 60 * 1000
const failures = new Map()

function clientIp(req){
    const forwarded = req.headers["x-forwarded-for"]
    return (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown"
}

function adminAuth(req, res, next){
    const ip = clientIp(req)
    const entry = failures.get(ip) ?? { count: 0, lockedUntil: 0 }
    if(entry.lockedUntil > Date.now()) return res.status(429).json({ error: "too many wrong keys - try again later" })

    const given = req.headers["x-admin-key"]
    if(typeof given === "string" && given.length <= 200 && crypto.timingSafeEqual(digest(given), KEY_DIGEST)){
        failures.delete(ip)
        return next()
    }
    // a lockout that ran out starts the count over
    if(entry.lockedUntil) { entry.count = 0; entry.lockedUntil = 0 }
    entry.count++
    if(entry.count >= MAX_FAILURES) entry.lockedUntil = Date.now() + LOCK_MS
    failures.set(ip, entry)
    return res.status(401).json({ error: "denied" })
}
router.use(adminAuth)

// ── the kept placements ──────────────────────────────────────────────────────
const WORLD_NAME = /^[a-z0-9_-]{1,40}$/i

router.get("/world-state/:name", async (req, res) => {
    try {
        if(!WORLD_NAME.test(req.params.name)) return res.status(400).json({ error: "bad name" })
        const doc = await AdminWorld.findOne({ name: req.params.name }).lean()
        res.json({ data: doc?.data ?? null, savedAt: doc?.updatedAt ?? null })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.put("/world-state/:name", async (req, res) => {
    try {
        if(!WORLD_NAME.test(req.params.name)) return res.status(400).json({ error: "bad name" })
        const data = req.body?.data
        if(!data || typeof data !== "object" || Array.isArray(data)) return res.status(400).json({ error: "data must be an object" })
        // only the lists the admin knows about
        const clean = {}
        for(const kind of ["enemies", "treasures", "grains", "mushrooms"]){
            clean[kind] = Array.isArray(data[kind]) ? data[kind].slice(0, 5000) : []
        }
        await AdminWorld.findOneAndUpdate({ name: req.params.name }, { name: req.params.name, data: clean }, { upsert: true, new: true, setDefaultsOnInsert: true })
        res.json({ ok: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ── characters that aren't online ────────────────────────────────────────────
const CHARACTER_FIELDS = "owner name lvl x y z currentPlace prevPlace"
const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

router.get("/characters", async (req, res) => {
    try {
        const q = String(req.query.q ?? "").trim()
        if(!q || q.length > 60) return res.status(400).json({ error: "give a name to look for" })
        const characters = await Character.find({ $or: [{ name: new RegExp(escapeRegex(q), "i") }, { owner: q }] })
            .select(CHARACTER_FIELDS).limit(20).lean()
        res.json({ characters })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

const inRange = (value, min, max) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max

router.post("/characters/:owner/reposition", async (req, res) => {
    try {
        const { placeId, name, areaType, x, y, z } = req.body ?? {}
        if(!Number.isInteger(placeId) || !inRange(placeId, 0, 100000)) return res.status(400).json({ error: "bad place" })
        if(typeof name !== "string" || typeof areaType !== "string" || name.length > 60 || areaType.length > 30) return res.status(400).json({ error: "bad place name" })
        if(!inRange(x, -1e6, 1e6) || !inRange(z, -1e6, 1e6) || !inRange(y, -1000, 10000)) return res.status(400).json({ error: "bad position" })

        // dotted paths: only these fields change, the rest of currentPlace stays
        const character = await Character.findOneAndUpdate(
            { owner: req.params.owner },
            { $set: { x, y, z, "currentPlace.placeId": placeId, "currentPlace.name": name, "currentPlace.areaType": areaType } },
            { new: true }
        ).select(CHARACTER_FIELDS).lean()
        if(!character) return res.status(404).json({ error: "no such character" })
        res.json({ ok: true, character })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router
