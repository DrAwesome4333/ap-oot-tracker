// @ts-check
import { POPUP_TYPE, Popups } from "./popup.js";
import { GameData } from "./gameData.js";

/**
 * @typedef CategoryDef
 * @prop {string[]} areas
 */

/**
 * @param {string} areaName The name of the area
 * @param {{}} context The name of the category
 */
let Category = (areaName, context) => {
    let area = GameData.areaMetaData[areaName];
    if(!area){
        debugger;
        throw `Failed to build Category ${areaName}, it could not be found`;
    }
    /** @type {{container:HTMLDivElement, readonly checkCount:number}[]} */
    let subAreas = [];
    let checkCount = 0;
    let container = document.createElement('div');
    let title = document.createElement('h3');
    title.innerText = areaName;
    title.classList.add("category_title")
    container.appendChild(title);
    let categoryContainer = document.createElement('div');
    container.appendChild(categoryContainer);
    categoryContainer.classList.add("category_container")

    let locationContainer = document.createElement('div');
    categoryContainer.appendChild(locationContainer);

    let toggleListVisibilitity = () => {
        if(title.nextElementSibling){
            title.nextElementSibling.classList.toggle('hidden');
            title.classList.toggle('hidden_content');
        }
    }
    title.addEventListener('click', toggleListVisibilitity);
    toggleListVisibilitity();

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
        categoryContainer.appendChild(area.container);
    }
    title.innerText = `${areaName} --/${checkCount}`;

    return {
        container,
        get checkCount(){return checkCount},
    }
}

/**
 * 
 * @param {string} name 
 * @returns 
 */
let expandCategory = (name) => {
    let categoryDef = GameData.categoryData[name];
    if(!categoryDef){
        throw `Failed to build Category ${name}, it could not be found`;
    }
    /** @type {string[]} */
    let areas = [];
    for(let areaDef of categoryDef.areas){
        if(areaDef.area_type){
            for(let area in GameData.areaMetaData){
                if(GameData.areaMetaData[area]["type"] == areaDef.area_type){
                    areas.push(area);
                }
            }
        }
    }
    return areas;
}


let Checklist = (() => {
    let container = document.createElement('div');
    container.id = "checklist"
    
    let categories = [];

    let build = () => {
        // TODO clean up
        let rootCategory = Category("root", {});
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