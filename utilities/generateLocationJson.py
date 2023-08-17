from LocationList import location_table
import json
locationDict = {}
for key in location_table:
    value = location_table[key]
    locationDict[key] = {
        "type": value[0],
        "categories": value[5]
    }
    
print(json.dumps(locationDict))

