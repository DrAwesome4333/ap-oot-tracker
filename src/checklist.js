// @ts-check
import { Screens } from "./screen.js"
import { LOCATION_DATA, DUNGEON_CATEGORIES, REGION_CATEGORIES, OVERWORLD_SCENE_CATEGORIES } from "./locations.js"
import { Client, SERVER_PACKET_TYPE, CLIENT_PACKET_TYPE } from "archipelago.js";

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
    let checked = [];
    let missing = [];
    for(let i = 0; i < client.locations.checked.length; i++){
        let name = client.locations.name(client.players.game(client.data.slot), client.locations.checked[i]);
        checked.push(name);
    }

    for(let i = 0; i < client.locations.missing.length; i++){
        let name = client.locations.name(client.players.game(client.data.slot), client.locations.missing[i]);
        missing.push(name);
    }
    return {
        checked,
        missing,
    }
}

/**
 * 
 * @param {"Dungeon" | "Region" | "Scene"} mode 
 * @param {{checked:string[], missing:string[]}} locations
 */
let buildCheckList = (mode, locations, separateChecked=true) => {
    let list = document.createElement('ul');
    switch (mode){
        case "Region":{
            for(let region in REGION_CATEGORIES){
                let subscenes = REGION_CATEGORIES[region].scenes;
                let regionItem = document.createElement('li');
                let title = document.createElement('h4');
                title.innerText = region;
                regionItem.appendChild(title);
                for(let scene of subscenes.values()){
                    let sceneTitle = document.createElement('h5');
                    sceneTitle.innerText = scene;
                    let sceneCheckList = buildCategoryList(scene, locations, separateChecked);
                    regionItem.append(sceneTitle);
                    regionItem.append(sceneCheckList);
                }
                list.append(regionItem);
            }
            break;
        }
    }
    return list;
};

/**
 * @param {string} category
 * @param {{checked:string[], missing:string[]}} locations
 */
let buildCategoryList = (category, locations, separateChecked=true) => {
    let list = document.createElement('ul');
    for(let i = 0; i < locations.missing.length; i++){
        let locationName = locations.missing[i];
        if(LOCATION_DATA[locationName].categories.has(category)){
            let item = document.createElement('li');
            item.innerText = locationName;
            item.classList.add('check');
            list.appendChild(item)
        }
    }

    for(let i = 0; i < locations.checked.length; i++){
        let locationName = locations.checked[i];
        if(LOCATION_DATA[locationName].categories.has(category)){
            let item = document.createElement('li');
            item.innerText = locationName;
            item.classList.add('check', 'checked');
            list.appendChild(item)
        }
    }
    return list;
};

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
        let fullList = buildCheckList("Region", locations);
        screen.div.appendChild(fullList);

    }
    return {
        reciveClient,
    }
})()

export {Checklist}