const { Schema, model } = require("mongoose")

const charSchema = new Schema({
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
    skinColor: {r: Number, g: Number, b: Number, name: String},
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

    survival: { hunger: {type: Number, default: 100}, sleep: {type: Number, default: 100} },
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
    characterType: { type: String, default: "player"},
    lastSpoken: {type: String, default: "none"},
})

module.exports = CharModel = model("character", charSchema)