// @ts-check
import { POPUP_TYPE, Popups } from "./popup.js";
import { GameData } from "./gameData.js";

/**
 * @typedef Category
 * @prop {number} checkCount
 * @prop {HTMLDivElement} container
 */

/**
 * @param {string} areaName The name of the area
 * @param {{}} context Object containing options 
 * 
 * @returns {Category}
 */
let Category = (areaName, context) => {
    let area = GameData.areaMetaData[areaName];
    if(!area){
        debugger;
        throw `Failed to build Category ${areaName}, it could not be found`;
    }
    /** @type {Category[]} */
    let subAreas = [];
    let checkCount = 0;
    let container = document.createElement('div');
    let title = document.createElement('h3');
    title.classList.add("category_title")
    container.appendChild(title);
    let categoryContainer = document.createElement('div');
    container.appendChild(categoryContainer);
    categoryContainer.classList.add("category_container")

    let locationContainer = document.createElement('div');
    categoryContainer.appendChild(locationContainer);

    if(areaName != "root"){
        let toggleListVisibilitity = () => {
            if(title.nextElementSibling){
                title.nextElementSibling.classList.toggle('hidden');
                title.classList.toggle('hidden_content');
            }
        }
        title.addEventListener('click', toggleListVisibilitity);
        toggleListVisibilitity();
    }else{
        title.classList.add("category_root");
    }

    if(area['sub_areas']){
        for(let subAreaName of area['sub_areas']){
            let newCategory = Category(subAreaName, context);
            checkCount += newCategory.checkCount;
            subAreas.push(newCategory);
        }
    }

    if(area["locations"]){
        for(let location in area["locations"]){
            if(!GameData.locationIdLookup.get(location)){
                continue;
            }
            let locContainer = document.createElement("div");
            locContainer.innerText = location;
            locationContainer.appendChild(locContainer);
            checkCount++;
        }
    }
    for(let area of subAreas){
        if(area.checkCount > 0){
            categoryContainer.appendChild(area.container);
        }
    }
    title.innerText = areaName == "root" ? `Total --/${checkCount}` : `${areaName} --/${checkCount}`;

    return {
        container,
        get checkCount(){return checkCount},
    }
}


let Checklist = (() => {
    let container = document.createElement('div');
    container.id = "checklist"
    
    let categories = [];
    /** @type {null | Category} */
    let rootCategory = null;

    let build = () => {
        // TODO clean up
        rootCategory = Category("root", {});
        container.appendChild(rootCategory.container);
    }

    let refresh = () => {

    }
    
    return {
        build,
        refresh,
        container,
    }
})()

export {Checklist}