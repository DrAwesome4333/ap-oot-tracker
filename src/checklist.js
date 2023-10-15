// @ts-check
import { Screens } from "./screen.js"
import { LOCATION_DATA, DUNGEON_CATEGORIES, REGION_CATEGORIES, OVERWORLD_SCENE_CATEGORIES } from "./locations.js"
import { Client, SERVER_PACKET_TYPE, CLIENT_PACKET_TYPE } from "archipelago.js";
import { Categories, buildDungeonDef, buildOverworldDef } from "./category.js";
import { POPUP_TYPE, Popups } from "./popup.js";
import { Invetory } from "./inventory.js";

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
 * @param {import("archipelago.js").Hint} hint 
 * @param {Client} client 
 */
let hintToText = (hint, client) => {
    let ownerString = `${client.players.alias(hint.receiving_player)}'s`;
    if(hint.receiving_player == client.data.slot){
        ownerString = 'your';
    }
    let finderString = `${client.players.alias(hint.finding_player)}'s`;
    if(hint.finding_player == client.data.slot){
        ownerString = 'your';
    }

    let itemString = client.items.name(client.players.game(client.data.slot), hint.item);
    
    let locationString = client.locations.name(client.players.game(client.data.slot), hint.location);
    return `${ownerString} ${itemString} is at ${locationString} in ${finderString} world. (${hint.entrance})`;
}

/**
 * 
 * @param {Client} client 
 */
let getLocationData = (client) => {
    let locations = new Set();
    let checkedLocations = new Set();
    let locationNames = new Map();
    /** @type {Map<number, string>} */
    let hintedLocations = new Map();
    for(let i = 0; i < client.locations.missing.length; i++){
        let location = client.locations.missing[i];
        let name = client.locations.name(client.players.game(client.data.slot), client.locations.missing[i]);
        locations.add(location);
        locationNames.set(location, name);
    }

    for(let i = 0; i < client.locations.checked.length; i++){
        let location = client.locations.checked[i];
        let name = client.locations.name(client.players.game(client.data.slot), client.locations.checked[i]);
        locations.add(location);
        checkedLocations.add(location);
        locationNames.set(location, name);
    }
   
    for(let i = 0; i < client.hints.mine.length; i++){
        let hint = client.hints.mine[i];
        if(hint.finding_player === client.data.slot){
            hintedLocations.set(hint.location, hintToText(hint, client))
        }
    }
    return {
        locations,
        checkedLocations,
        locationNames,
        hintedLocations,
    };
}

let Checklist = (() => {
    let container = document.createElement('div');
    container.id = "checklist"

    let overworldDef = buildOverworldDef(false, true, false, false, false);
    let dungeonDef = buildDungeonDef(false);
    let overworldCategeory = Categories.buildCategory(overworldDef);
    let dungeonCategeory = Categories.buildCategory(dungeonDef);
    /** @type {null | {checkedLocations:Set<number>, locations:Set<number>, locationNames:Map<number, string>, hintedLocations:Map<number, string>}} */
    let locations = null;

    /**
     * 
     * @param {Client} client 
     */
    let setClientListeners = (client) => {
        client.addListener(SERVER_PACKET_TYPE.RECEIVED_ITEMS, (packet) => {
            if(packet.items){
                let items = [];
                for(let i = 0; i < packet.items.length; i++){
                    items.push(client.items.name(client.players.game(client.data.slot), packet.items[i].item));
                }
                Invetory.addItems(packet.items);
                console.log('items added')
            }
        });

        client.addListener(SERVER_PACKET_TYPE.ROOM_UPDATE, (packet) => {
            console.log("Room update: ", packet);
            if(!locations){
                locations = getLocationData(client);
            }
            if(packet.checked_locations){
                for(let location of packet.checked_locations){
                    locations.checkedLocations.add(location);
                }
                refreshCategories();
            }
        });

    }

    let renderCategories = () => {
        let overworldElement = Categories.renderCategory(overworldCategeory, true);
        let dungeonElement = Categories.renderCategory(dungeonCategeory, true);
        if(overworldElement){
            container.appendChild(overworldElement);
        }else{
            Popups.createPopup(POPUP_TYPE.ERROR, 'An error occured building the over world')
        }
        if(dungeonElement){
            container.appendChild(dungeonElement);
        }else{
            Popups.createPopup(POPUP_TYPE.ERROR, 'An error occured building the Dungeon')
        }
    }

    let refreshCategories = () => {
        Categories.refreshCategory(overworldCategeory, true);
        Categories.refreshCategory(dungeonCategeory, true);
    }
    /**
     * 
     * @param {Client} client 
     */
    let receiveClient = (client) => {
        // show and clear checklist
        Screens.show('gameView');

        Invetory.build(client);
        if(!locations){
            locations = getLocationData(client);
        }
        Categories.populateCategory(overworldCategeory, locations.locations, locations.checkedLocations, locations.locationNames, locations.hintedLocations)
        Categories.populateCategory(dungeonCategeory, locations.locations, locations.checkedLocations, locations.locationNames, locations.hintedLocations)
        console.log(client.hints.mine)
        
        renderCategories();
        
        
    }
    return {
        receiveClient,
        setClientListeners,
        container,
    }
})()

export {Checklist}