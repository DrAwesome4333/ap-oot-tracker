from LocationList import location_table
import json
# Skulls that are found in these categories have no need to pass through other categorization methods
skullCategorySafe = {
    "Kokiri Forest",
    "Sacred Forest Meadow",
    "the Lost Woods",
    "Lon Lon Ranch",
    "Kakariko Village",
    "the Graveyard",
    "Death Mountain Trail",
    "Goron City",
    "Death Mountain Crater",
    "Zora's River",
    "Zora's Domain",
    "Zora's Fountain",
    "Gerudo Valley",
    "Gerudo's Fortress",
    "Desert Colossus",
}

# Any check in these needs no more categoirization
safeCategories = {
    "Deku Tree",
    "Dodongo's Cavern",
    "Jabu Jabu's Belly",
    "Bottom of the Well",

    "Forest Temple",
    "Fire Temple",
    "Water Temple",
    "Shadow Temple",
    "Spirit Temple",
    "Ice Cavern",
    "Gerudo Training Ground",
    "Ganon's Castle",

    "Thieves' Hideout",
    "Haunted Wasteland",

}

skullSceneMap = {
    0x0A: "Hyrule Field MANUAL CHANGE",
    0x0E: "Market Skull MANUAL CHANGE",
    0x12: "Lake Hylia skull MANUAL CHANGE",

}

sceneMap = {
    # general
    0xFF: "Cut Scene MANUAL CHANGE",
    0x3E: "Grotto MANUAL CHANGE",

    0x51: "Hyrule Field",
    0xE6: "HF Inside Fence Grotto",

    # Forest Scenes
    0X55: "Kokiri Forest",
    0x28: "Mido's House",
    0x34: "Link's House",
    0x2D: "Kokiri Shop",
    0x29: "Saria's House",
    0x26: "Know it All House",
    0x27: "House of Twins",
    0x5B: "the Lost Woods",
    0xF5: "LW Scrub Grotto",
    0xEE: "SFM Storms Grotto",

    # Market area
    0x42: "Market Shooting Gallery",
    0x4B: "Bombchu Bowling",
    0x35: "Dog Lady House",
    0x10: "Treasure Chest Game",
    0x4D: "Guard House",
    0x2C: "Market Bazaar",
    0x31: "Market Potion Shop",
    0x32: "Bombchu Shop",
    0x2B: "Man in Green House",
    0x21: "Market",
    0x5F: "Hyrule Castle",
    0x4A: "Hyrule Castle", # This is Zelda's courtyard

    # Lon Lon Ranch
    0x4C: "Talons House + LLR Tower MANUAL CHANGE",
    0x36: "LLR Stables",
    0xFC: "LLR Grotto",
    0x63: "Lon Lon Ranch",
    
    # Kak
    0x52: "Kakariko Village",
    0x37: "Impas House",
    0x48: "Dampes Grave/Windmill MANUAL CHANGE",
    0x42: "Kakariko Shooting Gallery",
    0x50: "House of Skulltula",
    0x2C: "Kak Bazaar",
    0x30: "Kak Potion Shop",

    # GY
    0x40: "Shield Grave",
    0x3F: "Heart Piece Grave",
    0x41: "Royal Familys Tomb",
    0x53: "Graveyard",

    # Death Mountain
    0x60: "Death Mountain Trail",
    0x62: "Goron City",
    0xFB: "GC Grotto",
    0x2E: "GC Shop",
    0x61: "Death Mountain Crater",
    0xF9: "DMC Hammer Grotto",

    # Zora
    0x54: "Zoras River",
    0xEB: "ZR Storms Grotto",
    0x58: "Zoras Domain",
    0x2F: "ZD Shop",
    0x59: "Zora's Fountain",

    # Lake
    0x57: "Lake Hylia",
    0x49: "Fishing Pond",
    0x38: "Lab",
    0xEF: "LH Grotto",

    # Gerudo
    0x5A: "Gerudo Valley",
    0xF0: "GV Storms Grotto",
    0x5D: "Gerudo's Fortress",

    # Desert
    0x5C: "Desert Colossus",
    0x5D: "Colossus Grotto",



}

locationDict = {}
for key in location_table:
    value = location_table[key]
    area = ""

    if value[1] == None:
        continue
    # Value[5] is the category column
    if value[5] and type(value[5]) is str:
        if value[5] in safeCategories:
            area = value[5]
        elif value[0] == 'GS Token' and value[5] in skullCategorySafe:
            area = value[5]
    elif value[5] and len(value[5]) > 0:
        for cat in value[5]:
            if cat in safeCategories:
                area = cat
                break
            elif value[0] == 'GS Token' and cat in skullCategorySafe:
                area = cat
                break
    elif value[0] == 'GS Token':
        area = skullSceneMap[value[1]]
        
    print(value)
    if area == "" and value[0] == 'GS Token':
        area = skullSceneMap[value[1]]
    elif area == "":
        area = sceneMap[value[1]]
            
    locationDict[key] = {
        "type": value[0],
        "categories": value[5],
        "area": area,
    }

    
print(json.dumps(locationDict))

#  Notes: fixed Market Dog Lady Crate to have "the Market" in stead of "Market" twice
