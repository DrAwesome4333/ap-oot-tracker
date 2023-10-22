// @ts-check
import { Categories, buildDungeonDef, buildOverworldDef } from "./category.js";
import { POPUP_TYPE, Popups } from "./popup.js";
import { GameData } from "./gameData.js";

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

let Checklist = (() => {
    let container = document.createElement('div');
    container.id = "checklist"

    let overworldDef = buildOverworldDef(false, true, false, false, false);
    let dungeonDef = buildDungeonDef(false);
    let overworldCategeory = Categories.buildCategory(overworldDef);
    let dungeonCategeory = Categories.buildCategory(dungeonDef);

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

    let buildChecklist = () => {
        // Invetory.build(client);
        Categories.populateCategory(overworldCategeory, GameData.locations, GameData.checkedLocations, GameData.hints);
        Categories.populateCategory(dungeonCategeory, GameData.locations, GameData.checkedLocations, GameData.hints);
        // console.log(client.hints.mine)
        renderCategories();
        
    }
    return {
        buildChecklist,
        refresh: refreshCategories,
        container,
    }
})()

export {Checklist}