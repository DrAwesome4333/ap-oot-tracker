// @ts-check
import { Screens } from "./screen.js"
import { LOCATION_DATA, DUNGEON_CATEGORIES, REGION_CATEGORIES, OVERWORLD_SCENE_CATEGORIES } from "./locations.js"
import { Client, SERVER_PACKET_TYPE, CLIENT_PACKET_TYPE } from "archipelago.js";
import { Categories, buildDungeonDef, buildOverworldDef } from "./category.js";
import { POPUP_TYPE, Popups } from "./popup.js";

/*
Settings:
Separate checked and not checked (forces checked locations to bottom of the list)
Separate Grottos (puts grottos into their own category)
Separate skulls (separates skulls into their own category)
Separate cows (separates cows into their own sub-category)
Separate shops (separates shops into their own category)

Future feature options:
Use hints on found locations to build ER map (should work for all but overworld rando)

*/

/**
 * 
 * @param {Client} client 
 */
let getLocationsAsStrings = (client) => {
    let locations = new Set();
    let checkedLocations = new Set();
    for(let i = 0; i < client.locations.missing.length; i++){
        let name = client.locations.name(client.players.game(client.data.slot), client.locations.missing[i]);
        locations.add(name);
    }

    for(let i = 0; i < client.locations.checked.length; i++){
        let name = client.locations.name(client.players.game(client.data.slot), client.locations.checked[i]);
        locations.add(name);
        checkedLocations.add(name);
    }
   
    return {
        locations,
        checkedLocations,
    };
}

let Checklist = (() => {
    let screen = Screens.createScreen('checklist');
    /**
     * 
     * @param {Client} client 
     */
    let reciveClient = (client) => {
        Screens.show('checklist');
        while(screen.div.firstChild){
            screen.div.firstChild.remove();
        }
        let locations = getLocationsAsStrings(client);
        let overworldDef = buildOverworldDef(true, true, true, true);
        let dungeonDef = buildDungeonDef(true);
        let overworldCategeory = Categories.buildCategory(overworldDef);
        let dungeonCategeory = Categories.buildCategory(dungeonDef);
        Categories.populateCategory(overworldCategeory, locations.locations, locations.checkedLocations)
        Categories.populateCategory(dungeonCategeory, locations.locations, locations.checkedLocations)
        let overworldElement = Categories.renderCategory(overworldCategeory, true);
        let dungeonElement = Categories.renderCategory(dungeonCategeory, true);
        if(overworldElement){
            screen.div.appendChild(overworldElement);
        }else{
            Popups.createPopup(POPUP_TYPE.ERROR, 'An error occured building the over world')
        }
        if(dungeonElement){
            screen.div.appendChild(dungeonElement);
        }else{
            Popups.createPopup(POPUP_TYPE.ERROR, 'An error occured building the Dungeon')
        }

    }
    return {
        reciveClient,
    }
})()

export {Checklist}