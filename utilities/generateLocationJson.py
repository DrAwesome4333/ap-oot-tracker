from LocationList import location_table
import json
# interiorSceneMap = {
#     0x28: "Mido's House",
#     0x34: "Link's House",
#     0x2D: "Kokiri Shop",
#     0x29: "Saria's House",
#     0x26: "Know it All House",
#     0x27: "House of Twins",
#     0x42: "Market Shooting Gallery",
#     0x4B: "Bombchu Bowling",
#     0x35: "Dog Lady House",
#     0x10: "Treasure Chest Game",
#     0x4D: "Guard House",
#     0x2C: "Market Bazaar",
#     0x31: "Market Potion Shop",
#     0x32: "Bombchu Shop",
#     0x2B: "Man in Green House",
#     0x4C: "Talon's House + LLR Tower",
#     0x36: "LLR Stables",

# }

locationDict = {}
for key in location_table:
    value = location_table[key]
    locationDict[key] = {
        "type": value[0],
        "categories": value[5],
    }
    
print(json.dumps(locationDict))

#  Notes: fixed Market Dog Lady Crate to have "the Market" in stead of "Market" twice
