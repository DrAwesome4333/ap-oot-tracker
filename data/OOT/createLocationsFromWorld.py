import json, re
import sys
from LocationList import location_table

# Modifications from orignal world files:
# capitalized the "it" in KF Know it All House, to match the region name

OVERWORLD_FILE_NAME = "./World/Overworld.json"


BOSS_FILE_NAME = "./World/Bosses.json"

DUNGEON_FILE_NAMES = [
    "./World/Bottom of the Well MQ.json",
    "./World/Bottom of the Well.json",
    "./World/Deku Tree MQ.json",
    "./World/Deku Tree.json",
    "./World/Dodongos Cavern MQ.json",
    "./World/Dodongos Cavern.json",
    "./World/Fire Temple MQ.json",
    "./World/Fire Temple.json",
    "./World/Forest Temple MQ.json",
    "./World/Forest Temple.json",
    "./World/Ganons Castle MQ.json",
    "./World/Ganons Castle.json",
    "./World/Gerudo Training Ground MQ.json",
    "./World/Gerudo Training Ground.json",
    "./World/Ice Cavern MQ.json",
    "./World/Ice Cavern.json",
    "./World/Jabu Jabus Belly MQ.json",
    "./World/Jabu Jabus Belly.json",
    "./World/Shadow Temple MQ.json",
    "./World/Shadow Temple.json",
    "./World/Spirit Temple MQ.json",
    "./World/Spirit Temple.json",
    "./World/Water Temple MQ.json",
    "./World/Water Temple.json",
]

OVERWORLD_REGION_NAMES = {
    "Kokiri Forest",
    "Lost Woods",
    "Sacred Forest Meadow",

    "Hyrule Field",
    "Lon Lon Ranch",

    "Lake Hylia",
    "Zoras Domain",
    "Zora River",
    "Zoras Fountain",

    "Kakariko Village",
    "Graveyard",

    "Death Mountain",
    "Death Mountain Crater",
    "Goron City",

    "Castle Grounds",
    "Market Entrance",
    "Market",
    "ToT Entrance",

    "Gerudo Valley",
    "Gerudo Fortress",
    "Haunted Wasteland",
    "Desert Colossus",
}

GRAVE_NAMES = {
    "Graveyard Shield Grave",
    "Graveyard Heart Piece Grave",
    "Graveyard Royal Familys Tomb",
    "Windmill and Dampes Grave",  # modified later by hand to separate checks
}

# Coppied from https://github.com/ArchipelagoMW/Archipelago/blob/12c73acb20cccfef53d1d205dbf6b8e8d70c1890/worlds/oot/Utils.py#L14
# As the JSON files are not valid JSON with the addtion of comments and new lines in values
def read_json(file_path):
    json_string = ""
    with open(file_path, 'r') as file:
        for line in file.readlines():
            json_string += line.split('#')[0].replace('\n', ' ')
    json_string = re.sub(' +', ' ', json_string)
    try:
        return json.loads(json_string)
    except json.JSONDecodeError as error:
        raise Exception("JSON parse error around text:\n" + \
                        json_string[error.pos - 35:error.pos + 35] + "\n" + \
                        "                                   ^^\n")

def categorizeScene(name):
    if name in OVERWORLD_REGION_NAMES:
        return "overworld"
    if "Grotto" in name or name == "Deku Theater" or name in GRAVE_NAMES:
        return "grave/grotto"
    return "interior"
        


scene_data = {}

# Loads locations from a region into a scene
def addLocations(region, scene_data, sceneName):
    if 'locations' in region:
        for locationName in region['locations']:
            if locationName in location_table:
                locationData = location_table[locationName]
                scene_data[sceneName]['locations'][locationName] = {
                                                                "type": locationData[0]
                                                            }

def addPosibleSubscenes(region, scene_data, sceneName):
    if 'exits' in region:
        for exitName in region['exits']:
            scene_data[sceneName]['subscenes'] += [exitName]


# Loads a dungeon type region to the scene data   
def addDungeonRegion(region, scene_data):
    if 'dungeon' in region:
        sceneName = region['dungeon']
        if not sceneName in scene_data:
            scene_data[sceneName] = {
                "type":"dungeon",
                "locations":{}
            }
        addLocations(region, scene_data, sceneName)

def addBossRegion(region, scene_data):
    if 'scene' in region:
        sceneName = region['scene']
        if not sceneName in scene_data:
            scene_data[sceneName] = {
                "type":"boss",
                "locations":{}
            }
        addLocations(region, scene_data, sceneName)

def addOverworldRegion(region, scene_data):
    if 'scene' in region:
        sceneName = region['scene']
        if not sceneName in scene_data:
            scene_data[sceneName] = {
                "type":categorizeScene(sceneName),
                "locations":{},
                "subscenes":[]
            }
        addLocations(region, scene_data, sceneName)
        addPosibleSubscenes(region, scene_data, sceneName)

def resolveScene(scene_data, scene):
    itemsToRemove = []
    for subscene in scene['subscenes']:
        if (subscene not in scene_data) or scene_data[subscene] == scene:
            itemsToRemove.append(subscene)
        elif scene_data[subscene]['type'] == 'overworld':
            itemsToRemove.append(subscene)
    # print(scene['subscenes'], sys.stderr)

    for itemToRemove in itemsToRemove:
        scene['subscenes'].remove(itemToRemove)
    if len(scene['subscenes']) == 0:
        del scene['subscenes']
    # print(itemsToRemove, sys.stderr)

def resolveSubscenes(scene_data):
    for key in scene_data:
        if 'subscenes' in scene_data[key]:
            resolveScene(scene_data, scene_data[key])

# Load dungeon locations
for worldFile in DUNGEON_FILE_NAMES:
    dungeon_data = read_json(worldFile)
    for region in dungeon_data:
        addDungeonRegion(region, scene_data)

overworld_data = read_json(OVERWORLD_FILE_NAME)
for region in overworld_data:
    addOverworldRegion(region, scene_data)

boss_data = read_json(BOSS_FILE_NAME)
for region in boss_data:
    addBossRegion(region, scene_data)

resolveSubscenes(scene_data)

            
                    
print(json.dumps(scene_data))

#Things done after by hand:
# Split Dampes grave and windmill
# Split Kak potion shop back into front and back
# Split Impa's house into front and back
# Put theives hideout together as one overworld location
# Added Ganon's Tower, not sure why they didn't get pulled in
# Added OVerworld, dungeon and root groups.
# Death Montain renamed to death mountain trail
# ToT Entrance renamed to Temple of Time Entrance