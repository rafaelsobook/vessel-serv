const { Schema, model } = require("mongoose")

const charSchema = new Schema({
    gender: { type: String, default: "male" }, // "male"/"female" - client/src/charactersystem/createcharacter.js's createAnimeBody branches the whole body/hair/outfit mesh selection on this
    owner: String,
    name: String,
    currentspeechId: { type:Number, default: 1},
    mode: { type: String, default: "idle" }, // idle// fighting // structed // paralized //
    stats: { 
        weapon: Number, 
        accuracy: Number,
        critical: Number, 
        dex: Number, 
        strength: Number, 
        magic: Number, 
        spd: {type: Number, default: 3.4},
        atkSpd: {type: Number, default: .9},
    },
    lvl: { type: Number, default: 1},
    // EXP -> Level system (client/src/charactersystem/characterstate.js's
    // gainExp) - separate from the existing Rank system (rank field below),
    // which keeps working exactly as it already did. statPoints is the
    // spendable pool statsSystem.js's upgrade-btn UI now draws from, +1
    // granted per level.
    exp: { type: Number, default: 0},
    statPoints: { type: Number, default: 0},
    rank: { rankNumber: Number, curr: Number, pointsToRank: { type: Number, default: 12}, rankLabel: String },
    hp: { type: Number, default: 50},
    maxHp: { type: Number, default: 50},
    mp: { type: Number, default: 100},
    maxMp: { type: Number, default: 100},
    sp: { type: Number, default: 1000},
    maxSp: { type: Number, default: 1000},
    defeatedFoes: { type: Array, default: [
        { foeType: "monster", total: 0 },
        { foeType: "human", total: 0 },
        { foeType: "demon", total: 0 },
        { foeType: "higher demon", total: 0 },
        { foeType: "dragon", total: 0 },
        { foeType: "god", total: 0 },
    ]},
    x:{ type: Number, default: 0},
    y:{ type: Number, default: 0},
    z:{ type: Number, default: 0},
    outsideRoomPosition: { x: Number, y: Number, z: Number },
    cloth: String,
    pants: String,
    hair: String,
    skinColor: String, // one of SKIN_TEXTURES' keys in client/src/constants/skinColors.js, e.g. "skin1"
    hairColor: {r: Number, g: Number, b: Number},
    clothColor: {r: Number, g: Number, b: Number},
    pantsColor: {r: Number, g: Number, b: Number},
    items: {type: Array, default: []}, // lagay mo na lahat dito pate gold silver bronze same lang sila ng itemId lahat ng same ang itemId mag stack tapos meron din prop na stackable: true   krit: {type: Number, default: 0 } fins: {type: Number, default: 0 } dramite: {type: Number, default: 0 }
    skills: { type: Array, default: []},
    titles: { type: Array, default: [] },    
    currentPlace: { placeId: Number, name: String, areaType: String, pos: { x: Number, y: Number, z: Number } },
    prevPlace: { placeId: Number, name: String, areaType: String, pos: { x: Number, y: Number, z: Number } }, // for rooms only
    places: { type: Array, default: [] }, 
    status: { type: Array, default: []}, // sickness //poisoned etc
    // regens: { sp: {type: Number, default: 0}, hp: {type: Number, default: 0}, mana: {type: Number, default: 0} },
    monsSoul: { type: Number, default: 1}, // same like points system

    // bodytemp: third survival stat alongside hunger/sleep. Default matches
    // client constants/weather.js BODY_TEMP_NORMAL - a character is created
    // comfortable, not at 0 (which the client would read as lethal cold).
    survival: { hunger: {type: Number, default: 100}, sleep: {type: Number, default: 100}, bodytemp: {type: Number, default: 35} },
    aptitude: { type: Array, default: [] },
    monsterKilled: { type: Number, default: 0},
    defeatedMonsters: { type: Array, default: []}, // name of monsters
    blessings: { type: Array, default: [] }, // aka abilities
    // { qName: "", qTitle: "", desc: "", questType: //story//hunt//reqItem }
    // talkTo: npcName, huntRequire: { name: "daedalus"//reqItem//"goblin"//hunt, current:0, total: 5 }
    // in creation of NPC they have a list of quest that will match the title of this quest so
    // you wont have any problems what will go first
    stories:{type: Array, default: []},// for story
    quests: {type: Array, default: []}, //
    clearedQuests: {type: Array, default: []},
    race: { type: String, default: "human" },
    // multi-class progress, not a single pick-one-at-creation slot - every
    // known class gets its own tracked entry (experties + lvl) from the
    // start, same "always a concrete default, never null/undefined" style
    // every other field in this schema already follows. experties is one of
    // the 4 REAL weaponType values client/src/staticRecources/npcDetails.js
    // actually has (sword/staff/axe/pickaxe) - one each, no two classes
    // sharing a value, so this field alone is always enough to tell them
    // apart. Nested {type, default} objects (not bare "sword"/0 literals)
    // are required here, same reason rank's own pointsToRank sub-field
    // above uses that form instead of a bare shorthand - mongoose reads a
    // literal string/number value in this position as an attempt to
    // declare the PATH's type itself, not a default.
    characterclass: {
        warbringer: {
            experties: { type: String, default: "sword" },
            lvl: { type: Number, default: 0 },
        },

        // pickaxe/axe are real weaponType values, but only ever seeded as
        // gathering-tool items so far (npcDetails.js's "Miner's Edge"/
        // "Farmer's Axe") - reused here purely for a distinct combat
        // flavor per class, same as sword/staff already are, not implying
        // duskrunner/soulmender actually mine or farm with them
        duskrunner: {
            experties: { type: String, default: "pickaxe" },
            lvl: { type: Number, default: 0 },
        },
        viking: {
            experties: { type: String, default: "axe" },
            lvl: { type: Number, default: 0 },
        },
        berserker: {
            experties: { type: String, default: "fist" },
            lvl: { type: Number, default: 0 },
        },
        paladin: {
            experties: { type: String, default: "spear" },
            lvl: { type: Number, default: 0 },
        },
        warhammer: {
            experties: { type: String, default: "hammer" },
            lvl: { type: Number, default: 0 },
        },
        runecaller: {
            experties: { type: String, default: "staff" },
            lvl: { type: Number, default: 0 },
        },
        necromancer: {
            experties: { type: String, default: "summoner" },
            lvl: { type: Number, default: 0 },
        },
    },
    characterType: { type: String, default: "player"},
    lastSpoken: {type: String, default: "none"},
    achievements: { type: Array, default: [] },
    duelHistory: { type: Array, default: [] }, // {opponentName: "", result: "win"//"lose"//"draw", date: Date.now() }
})

module.exports = CharModel = model("character", charSchema)