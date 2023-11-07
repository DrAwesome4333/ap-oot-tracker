// @ts-check
import { POPUP_TYPE, Popups } from "./popup.js";
import { GameData } from "./gameData.js";
import { OptionsView } from "./optionsView.js";

/**
 * @typedef CategoryCheck
 * @prop {boolean} checked
 * @prop {boolean} hinted
 * @prop {number} id
 * @prop {HTMLDivElement} container
 * @prop {()=>void} update
 */

/**
 * 
 * @param {number} id id of represented location
 * @returns {CategoryCheck}
 */
let CategoryCheck = (id) => {
    let location = GameData.locations.get(id);
    if(!location){
        console.warn(`Could not get location information for location id ${id}`);
    }
    let locContainer = document.createElement("div");
    locContainer.innerText = location?.name || `Unrecognized locaton ${id}`;
    locContainer.classList.add('check');

    let hintContainer = document.createElement('div');
    hintContainer.classList.add('hint');

    locContainer.appendChild(hintContainer);

    let toggleHintVisiblity = () =>{
        hintContainer.classList.toggle("hidden");
    }
    toggleHintVisiblity();


    let update = () => {
        let hint = GameData.hints.get(id);
        if(GameData.checkedLocations.has(id)){
            locContainer.classList.add("checked");
            if(hint){
                locContainer.classList.remove('hinted');   
                locContainer.title = "";
                hintContainer.classList.add('hidden');
                locContainer.removeEventListener('click', toggleHintVisiblity);             
            }
        }
        else if (hint){
            locContainer.classList.add('hinted');
            locContainer.title = hint;
            hintContainer.innerText = hint;
            locContainer.addEventListener('click', toggleHintVisiblity);
        }
    }
    update();


    return {
        id,
        get checked(){return GameData.checkedLocations.has(id)},
        get hinted(){return GameData.hints.has(id)},
        container:locContainer,
        update,
    }
}

/**
 * @typedef Category
 * @prop {number} checkCount
 * @prop {number} hintCount
 * @prop {number} checkedCount
 * @prop {HTMLDivElement} container
 * @prop {()=>void} update
 * @prop {boolean} flattened
 * @prop {Category[]} subAreas
 * @prop {CategoryCheck[]} categoryChecks
 */

/**
 * @param {string} areaName The name of the area
 * @param {CategoryContext} context Object containing options 
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
    /** @type {CategoryCheck[]} */
    let categoryChecks = [];
    let checkCount = 0;
    let checkedCount = 0;
    let hintedCount = 0;
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
        let toggleListVisibility = () => {
            if(title.nextElementSibling){
                title.nextElementSibling.classList.toggle('hidden');
                title.classList.toggle('hidden_content');
            }
        }
        title.addEventListener('click', toggleListVisibility);
        toggleListVisibility();
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
            let locationId = GameData.locationIdLookup.get(location);
            if(!locationId){
                continue;
            }
            let newCheck = CategoryCheck(locationId);
            categoryChecks.push(newCheck);
            locationContainer.appendChild(newCheck.container); 
            checkCount++;
        }
    }
    /** @type {Category[]} */
    let areasToAdd = [];
    for(let area of subAreas){
        if(area.checkCount > 0 && area.flattened){
            for(let check of area.categoryChecks){
                categoryChecks.push(check);
            }
            for(let subArea of area.subAreas){
                subAreas.push(subArea);
            }
        }
    }
    subAreas.push(...areasToAdd);
    for(let area of subAreas){
        if(area.checkCount > 0 && !area.flattened){
            categoryContainer.appendChild(area.container);
        }
    }

    let separateChecked = () => {
        let checkedChecks = [];
        for(let check of categoryChecks){
            if(check.checked){
                checkedChecks.push(check);
            }else{
                locationContainer.appendChild(check.container);
            }
        }
        for(let check of checkedChecks){
            locationContainer.appendChild(check.container);
        }
    }


    let update = () => {
        checkedCount = 0;
        hintedCount = 0;
        for(let subArea of subAreas){
            if(subArea.flattened){
                continue;
            }
            subArea.update();
            checkedCount += subArea.checkedCount;
            hintedCount += subArea.hintCount;
        }
        for(let check of categoryChecks){
            check.update();
            checkedCount += check.checked ? 1 : 0;
            hintedCount += check.hinted && !check.checked ? 1 : 0;
        }
        title.innerText = areaName == "root" ? `Total ${checkedCount}/${checkCount}` : `${areaName} ${checkedCount}/${checkCount}`;
        if(hintedCount > 0){
            title.classList.add('hinted');
        }
        separateChecked();
    }
    update();

    return {
        container,
        get checkCount(){return checkCount},
        get hintCount(){return hintedCount},
        get checkedCount(){return checkedCount},
        get flattened(){return context.flattenRules.has(area['type'])},
        categoryChecks,
        subAreas,
        update,
    }
}

/**
 * @typedef CategoryContext
 * @prop {Set<string>} flattenRules
 */

let Checklist = (() => {
    let container = document.createElement('div');
    container.id = "checklist"
    
    /** @type {null | Category} */
    let rootCategory = null;

    let build = () => {
        while (container.firstChild){
            container.firstChild.remove();
        }
        /**
         * @type {CategoryContext}
         */
        let context = {
            flattenRules:new Set()
        }
        if(!OptionsView.options["separateGravesAndGrottos"]){
            context.flattenRules.add("grave/grotto")
        }
        if(!OptionsView.options["separateInteriors"]){
            context.flattenRules.add("interior")
        }
        if(!OptionsView.options["separateOverworld"]){
            context.flattenRules.add("overworld")
        }
        if(!OptionsView.options["separateDungeons"]){
            context.flattenRules.add("dungeon")
        }
        if(!OptionsView.options["separateBosses"]){
            context.flattenRules.add("boss")
        }
        rootCategory = Category("root", context);
        container.appendChild(rootCategory.container);
    }

    let refresh = () => {
        rootCategory?.update();
    }
    
    return {
        build,
        refresh,
        container,
    }
})()

export {Checklist}