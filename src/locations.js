// @ts-check

const DUNGEON_CATEGORIES = [
    "Deku Tree",
    "Dodongo's Cavern",
    "Jabu Jabu's Belly",
    "Forest Temple",
    "Fire Temple",
    "Water Temple",
    "Shadow Temple",
    "Spirit Temple",
    "Ice Cavern",
    "Bottom of the Well",
    "Gerudo Training Ground",
    "Thieves' Hideout",
    "Ganon's Castle",
];

const OVERWORLD_SCENE_CATEGORIES = [
    "Lon Lon Ranch",
    "Hyrule Field",
    "Sacred Forest Meadow",
    "Kokiri Forest",
    "the Lost Woods",
    "the Graveyard",
    "Kakariko Village",
    "Death Mountain Crater",
    "Death Mountain Trail",
    "Goron City",
    "Hyrule Castle",
    "Temple of Time",
    "the Market",
    "Market Entrance",
    "Lake Hylia",
    "Zora's River",
    "Zora's Domain",
    "Zora's Fountain",
    "Gerudo Valley",
    "Gerudo's Fortress",
    "Haunted Wasteland",
    "Desert Colossus",
]
/**
 * @type {Object<string, string[]>}
 */
const REGION_CATEGORIES = {
    "Market":["Hyrule Castle", "Temple of Time", "the Market", "Market Entrance", "Outside Ganon's Castle"],
    "Lon Lon Ranch": ["Lon Lon Ranch"],
    "Forest": ["Kokiri Forest", "the Lost Woods", "Sacred Forest Meadow"],
    "Kakariko": ["Kakariko Village", "the Graveyard"],
    "Hyrule Field": ["Hyrule Field"],
    "Death Mountain": ["Death Mountain Trail", "Death Mountain Crater", "Goron City"],
    "Desert": ["Desert Colossus", "Haunted Wasteland"],
    "Lake Hylia": ["Lake Hylia"],
    "Zora": ["Zora's River", "Zora's Domain", "Zora's Fountain"],
    "Gerudo": ["Gerudo Valley", "Gerudo's Fortress"],
};

export {REGION_CATEGORIES, OVERWORLD_SCENE_CATEGORIES, DUNGEON_CATEGORIES}