// @ts-check
import { Popups, POPUP_TYPE} from "./popup.js";
import { Client, ITEMS_HANDLING_FLAGS, SERVER_PACKET_TYPE} from "archipelago.js";

import { Checklist } from "./checklist.js";
import { Inventory } from "./inventory.js";

/**
 * @typedef ItemLocation
 * @prop {string} name
 * @prop {string} type
 * @prop {string} area
 * @prop {number} id
 * @prop {Set<string>} categories
 */

/**
 * @typedef Item
 * @prop {string} name
 * @prop {number} id
 * @prop {boolean} isProgressive
 */

/**
 * @typedef CategoryOption
 * @prop {"checkbox"|"dropdown"} type
 * @prop {string} category
 * @prop {string} tag
 * @prop {string|boolean} default
 * @prop {string[]} options
 */

/**
 * @typedef AreaCondition
 * @prop {string} rule The name of the category option tag to refer to
 * @prop {string|boolean} value The value the option must be to activate
 */

/**
 * @typedef AreaSwapRule
 * @prop {string} label Used for identifying the uncategorized section by name
 * @prop {string} type Types of sub areas the rule will swap out
 * @prop {AreaCondition} condition When should this option be available
 * 
 */

/**
 * @typedef AreaSeparationRule
 * @prop {string} label Used for identifying the uncategorized section by name
 * @prop {string} type Types of sub areas the rule will be separated
 * @prop {AreaCondition} condition When should this option be available
 * 
 */

/**
 * @typedef AreaDef
 * @prop {string} area_type
 * @prop {AreaSwapRule[]} area_swap_rules
 * @prop {AreaSeparationRule[]} area_separate_locations
 *  
 */

/**
 * @typedef CategoryData
 * @prop {Object.<string, CategoryOption>} options
 * @prop {AreaDef[]} areas
 * 
 */

// GameData is meant to be an abstraction of game data so the UI doesn't need to care about archipelago.js and how it works
let GameData = (()=>{
    let client = new Client();

    /** @type {Item[]} */
    let inventory = [];

    let areaData = {};

    /** @type {Map<number, ItemLocation>} */
    let locations = new Map();

    /** @type {Map<string, number>} */
    let locationIdLookup = new Map();

    /** @type {Map<string, CategoryData>} */
    let categoryData = new Map();

    /** @type {Set<number>} */
    let checkedLocations = new Set();

    /** @type {Map<number, string>}*/
    let hints = new Map();

    /**
     * 
     * @param {import("archipelago.js").Hint} hint 
     */
    let hintToText = (hint) => {
        let ownerString = `${client.players.alias(hint.receiving_player)}'s`;
        if(hint.receiving_player == client.data.slot){
            ownerString = 'Your';
        }
        let finderString = `${client.players.alias(hint.finding_player)}'s`;
        if(hint.finding_player == client.data.slot){
            finderString = 'your';
        }

        let itemString = client.items.name(client.players.game(hint.receiving_player), hint.item);
        
        let locationString = client.locations.name(client.players.game(hint.finding_player), hint.location);

        let entranceString = hint.entrance ? `(${hint.entrance})` : '';
        return `${ownerString} ${itemString} is at ${locationString} in ${finderString} world. ${entranceString}`;
    }

    let loadCategoryData = async () => {
        categoryData = new Map();
        await fetch("./data/OOT/category.json")
        .then(r => r.json())
        .then(data => {
            for(let key in data){
                categoryData.set(key, data[key]);
            }
        })
    };

    let loadLocationData = async () => {
        locations = new Map();
        locationIdLookup = new Map();

        // Load location meta data
        let locationMetaData = await fetch("./data/OOT/location.json")
            .then(r => r.json())
            .then(data => {
                areaData = data;
                let metaData = {};
                for(let areaName in data){
                    let area = data[areaName];
                    if(area.locations){
                        for(let location in area.locations){
                            metaData[location] = area.locations[location];
                        }
                    }
                }
                return metaData;
            })
            .catch(e => {
                Popups.createPopup(POPUP_TYPE.ERROR, "Could not load location data. See dev console for details");
                throw e;
            });
        
        
        // Get locations in current game
        /** @param {number} id */
        let addLocation = (id) => {
            let locationName = client.locations.name(client.players.game(client.data.slot), id);
            if(!locationMetaData[locationName]){
                console.warn(`Unrecognized location name: ${locationName} in list of locations`);
                locations.set(id,
                    {
                        name: locationName,
                        id,
                        type: "Unknown",
                        area: "Uncategorized",
                        categories: new Set(),
                    });
            } else {
                let itemLocation = {
                    name: locationName,
                    id,
                    type: locationMetaData[locationName]["type"],
                    area: locationMetaData[locationName]["area"],
                    categories: new Set(),
                }
                if(locationMetaData[locationName]["categories"]){
                    if(typeof locationMetaData[locationName]["categories"] == "string"){
                        itemLocation.categories.add(locationMetaData[locationName]["categories"]);
                    }else{
                        locationMetaData[locationName]["categories"].forEach(category => itemLocation.categories.add(category))
                    }
                }
                locations.set(id, itemLocation);
                locationIdLookup.set(locationName, id);
            }

        }

        for(let i = 0; i < client.locations.missing.length; i++){
            addLocation(client.locations.missing[i]);
        }

        for(let i = 0; i < client.locations.checked.length; i++){
            addLocation(client.locations.checked[i]);
            checkedLocations.add(client.locations.checked[i]);
        }
    }

    let loadHintData = () => {
        /** @type {Map<number, string>} */
        hints = new Map();
        for(let i = 0; i < client.hints.mine.length; i++){
            let hint = client.hints.mine[i];
            if(hint.finding_player === client.data.slot){
                hints.set(hint.location, hintToText(hint))
            }
        }
    }

    client.addListener(SERVER_PACKET_TYPE.RECEIVED_ITEMS, (packet) => {
        if(packet.items){
            for(let i = 0; i < packet.items.length; i++){
                let item = {
                    id: packet.items[i].item,
                    name: client.items.name(client.players.game(client.data.slot), packet.items[i].item),
                    isProgressive: (packet.items[i].flags & 1) ? true : false,
                }
                inventory.push(item);
            }
            console.log('items added');
            Inventory.refresh();
        }
    });

    client.addListener(SERVER_PACKET_TYPE.ROOM_UPDATE, (packet) => {
        console.log("Room update: ", packet);

        if(packet.checked_locations){
            for(let location of packet.checked_locations){
                checkedLocations.add(location);
            }
            Checklist.refresh();
        }
    });

    // These packets are called and trigger the hint list to update, since there is no way to directly listen
    // for the hint list update, I listen for the same events as it does
    client.addListener(SERVER_PACKET_TYPE.SET_REPLY, (packet) => {
        if (packet.key === `_read_hints_${client.data.team}_${client.data.slot}`) {
            loadHintData();
            Checklist.refresh();
        }
    });

    client.addListener(SERVER_PACKET_TYPE.RETRIEVED, (packet) => {
        for (const key in packet.keys) {
            if (key !== `_read_hints_${client.data.team}_${client.data.slot}`) {
                continue;
            }

            loadHintData();
            Checklist.refresh();
        }
    });


    window.addEventListener("beforeunload", () => {
        client.disconnect();
    });
    /**
     * 
     * @param {string} host 
     * @param {string} port 
     * @param {string} slot 
     * @param {string} game 
     * @param {string} password 
     */
    let connectToServer = async (host, port, slot, game, password) => {
        // verify
        if(host === ''){
            return new Promise((resolve, reject)=>{reject("Please specify a host address");});
        }
        if(port === '' || isNaN(parseInt(port))){
            return  new Promise((resolve, reject)=>{reject("Invalid port number");});
        }
        if(slot === ''){
            return  new Promise((resolve, reject)=>{reject("Please specify a slot name");});
        }
        if(game === ''){
            return  new Promise((resolve, reject)=>{reject("Please specify a game");});
        }
       
        // clear any existing inventory data
        inventory = [];
        locations.clear();
        checkedLocations.clear();
        // Todo, call call backs for resetting invetory, locaitons, and checked locaitons

        Popups.createPopup(POPUP_TYPE.INFO, 'Connecting...');

        /** @type {import("archipelago.js").ConnectionInformation} */
        let connectionInfo = {
            hostname: host,
            port: Number.parseInt(port),
            name: slot,
            game: game,
            items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
            password: password,
            tags: ['Tracker'],
        }
    
        // Connect to the Archipelago server
        return client
            .connect(connectionInfo)
            .then((packet) => {
                console.log("Connected to the server");
                Popups.createPopup(POPUP_TYPE.SUCCESS, `Succesfully connected as ${client.players.alias(packet.slot)}`);
                saveConnectionInformation(connectionInfo);
            })
            .then(_ => loadLocationData())
            .then(_ => loadCategoryData())
            .then(_ => {
                loadHintData();
                Checklist.build();
                Checklist.refresh();
                Inventory.build();
                Inventory.refresh();
            })
            .catch((error) => {
                console.error("Failed to connect:", error);
                if(typeof error[0] === 'string'){
                    let e = error[0];
                    if(e == 'InvalidSlot'){
                        return new Promise((_, reject)=>{reject("Failed to connect to slot, the slot name was invalid.");});
                    }else if(e == 'InvalidGame'){
                        return new Promise((_, reject)=>{reject("Failed to connect to slot, the game name was invalid.");});
                    }else {
                        return new Promise((_, reject)=>{reject(`Failed to connect to slot, reason given by server: ${e}`);});
                    }
                }else{
                    return new Promise((_, reject)=>{reject(`Failed to connect to server, please verify connection details are correct and the server is running. ${host=='archipelago.gg' ? 'You can restart the server on archipelago.gg by reloading the room page.': 'Check with the server host for server status.'}`)});
                }
                
            });
    }
    
    /**
     * 
     * @param {import("archipelago.js").ConnectionInformation} connectionInfo 
     */
    let saveConnectionInformation = (connectionInfo) => {
        let savedInformation = {
            hostname: connectionInfo.hostname,
            port: connectionInfo.port,
            slot: connectionInfo.name,
        }
        localStorage.setItem('archipelagoTrackerLastConnection', JSON.stringify(savedInformation));
    }
        
    let loadSavedConnectionInformation = () => {
        let defaultConnection = {
            hostname: 'archipelago.gg',
            port: '',
            slot: '',
        }
        let savedData = localStorage.getItem('archipelagoTrackerLastConnection');
        return savedData ? JSON.parse(savedData) : defaultConnection;
    }

    let playerName = () => {
        return client.data.slot == -1 ? "(Not Connected)" : client.players.alias(client.data.slot);
    }



    
    return {
        connectToServer,
        loadSavedConnectionInformation,
        get playerName(){return playerName()},
        get gameName(){return client.players.game(client.data.slot)},
        get inventory() {return inventory},
        get checkedLocations() {return checkedLocations},
        get locations() {return locations},
        get locationIdLookup() {return locationIdLookup},
        get areaMetaData() {return areaData},
        get categoryData() {return categoryData},
        get hints() {return hints},

    }

})();

export {GameData}