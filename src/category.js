// @ts-check
/**
 * @typedef Category
 * @prop {string} name
 * @prop {string} id
 * @prop {Category[]} subCategories
 * @prop {Map<number, import("./gameData.js").ItemLocation>} locations
 * @prop {Set<string>} allowFilter
 * @prop {Set<string>} blockFilter
 * @prop {Set<number>} unclaimedLocations // Locations not claimed by any sub categories
 * @prop {Set<number>} [checkedLocations]
 * @prop {Map<number, string>} [hintedLocations]
 * @prop {Number} checkedCount
 */

import { DUNGEON_CATEGORIES, REGION_CATEGORIES } from "./locations.js";

/**
 * @typedef CategoryDef
 * @prop {string} name
 * @prop {string | string[]} allowFilter
 * @prop {string | string[]} blockFilter
 * @prop {CategoryDef[]} subCategories
 */

let categoryIdGen = (() => {
    let nextId = 1;
    return {
        get next() {return `category_${nextId++}`}
    }
})()

let Categories = (() => {

    /**
     * @param {CategoryDef} categoryDef
     * @returns {Category}
     */
    let buildCategory = (categoryDef) => {
        /** @type {Map<number, import("./gameData.js").ItemLocation>} */
        let locations = new Map();
        let unclaimedLocations = new Set();
        let id = categoryIdGen.next;
        /** @type {Category[]} */
        let subCategories = [];
        let name = categoryDef.name;
        for(let i = 0; i < categoryDef.subCategories.length; i++){
            subCategories.push(buildCategory(categoryDef.subCategories[i]));
        }
        let allowFilter = new Set();
        let blockFilter = new Set();

        if(typeof categoryDef.allowFilter === 'string'){
            allowFilter.add(categoryDef.allowFilter);
        }else{
            for(let i = 0; i < categoryDef.allowFilter.length; i++){
                allowFilter.add(categoryDef.allowFilter[i]);
            }
        }

        if(typeof categoryDef.blockFilter === 'string'){
            blockFilter.add(categoryDef.blockFilter);
        }else{
            for(let i = 0; i < categoryDef.blockFilter.length; i++){
                blockFilter.add(categoryDef.blockFilter[i]);
            }
        }
        
        return {
            name,
            locations,
            unclaimedLocations,
            subCategories,
            allowFilter,
            blockFilter,
            id,
            get checkedCount () {
                let count = 0;
                if(this.checkedLocations){
                    for(let location of locations.values()){
                        if(this.checkedLocations.has(location.id)){
                            count++;
                        }
                    }
                }
                return count;
            }
            
        }
    }

    /**
     * 
     * @param {Category} category 
     * @param {Map<Number, import("./gameData.js").ItemLocation>} locations 
     * @param {Set<Number>} checkedLocations
     * @param {Map<Number, String>} hintedLocations
     */
    let populateCategory = (category, locations, checkedLocations, hintedLocations) => {
        category.checkedLocations = checkedLocations;
        category.hintedLocations = hintedLocations;
        for(let location of locations.values()){
            let wasBlocked = false;
            for(let locationCategory of location.categories.values()){
                if(category.blockFilter.has(locationCategory)){
                    wasBlocked = true;
                    break;
                }
            }
            if(wasBlocked){
                continue;
            }
            for(let locationCategory of location.categories.values()){
                if(category.allowFilter.has(locationCategory)){
                    category.locations.set(location.id, location);
                    category.unclaimedLocations.add(location.id);
                    break;
                }
            }
        }
        for(let i = 0; i < category.subCategories.length; i++){
            populateCategory(category.subCategories[i], category.locations, checkedLocations, hintedLocations);
            for(let location of category.subCategories[i].locations.values()){
                category.unclaimedLocations.delete(location.id);
            }
        };
    }

    /**
     * 
     * @param {Category} category 
     */
    let renderCategory = (category, separateChecked=true) => {
        if(category.locations.size == 0){
            return null;
        }
        let container = document.createElement('div');
        let title = document.createElement('h4');
        title.innerText = `${category.name} ${category.checkedCount}/${category.locations.size} `;
        let list = document.createElement('ul');
        title.classList.add('category_title')
        title.id = `${category.id}_title`
        container.appendChild(title);
        container.appendChild(list);
        let toggleListVisibilitity = () => {
            if(title.nextElementSibling){
                title.nextElementSibling.classList.toggle('hidden');
                title.classList.toggle('hidden_content');
            }
        }
        title.addEventListener('click', toggleListVisibilitity);
        toggleListVisibilitity();

        for(let location of category.unclaimedLocations.values()){
            let item = document.createElement('li');
            item.id = `${category.id}_${location}`;
            item.innerText = category.locations.get(location)?.name || `Unkown Location ${location}`;
            item.classList.add('check')
            if(category.checkedLocations?.has(location)){
                item.classList.add('checked');
            }
            if(category.hintedLocations?.has(location)){
                item.classList.add('hinted');
                item.title = category.hintedLocations.get(location) || "";
            }
            list.appendChild(item);
        }
        for(let subCat = 0; subCat < category.subCategories.length; subCat++){
            let subList = renderCategory(category.subCategories[subCat], separateChecked);
            if(subList){
                let item = document.createElement('li');
                item.appendChild(subList)
                list.appendChild(item);
            }
        }
        return container;
    }

    /**
     * 
     * @param {Category} category 
     */
    let refreshCategory = (category, separateChecked=true) => {
        if(category.locations.size == 0){
            return;
        }
        let title = document.querySelector(`#${category.id}_title`);
        if(title){
            // @ts-ignore
            title.innerText = `${category.name} ${category.checkedCount}/${category.locations.size} `;
        }

        for(let location of category.unclaimedLocations.values()){
            let item = document.querySelector(`#${category.id}_${location}`);
            
            if(category.checkedLocations?.has(location) && item && !item.classList.contains('checked')){
                item.classList.add('checked')
                // TODO
                // if(separateChecked){
                //     // move check to bottom
                //     let parent = item.parentElement;
                //     item.remove();
                //     parent?.appendChild(item);
                // }
            }
            if(item && category.hintedLocations?.has(location)){
                item.classList.add('hinted');
                // @ts-ignore
                item.title = category.hintedLocations.get(location) || "";
            }
        }
        for(let subCat = 0; subCat < category.subCategories.length; subCat++){
            refreshCategory(category.subCategories[subCat], separateChecked);
        }
    }
    return {
        populateCategory,
        buildCategory,
        renderCategory,
        refreshCategory,
    }
})();

/**
 * 
 * @param {boolean} separateGrottos 
 * @param {boolean} separateSkulls 
 * @param {boolean} separateCows 
 * @param {boolean} separateShops 
 */
let buildOverworldDef = (separateGrottos, separateSkulls, separateCows, separateShops, divideRegions=true) => {
    /** @type {CategoryDef} */
    let overworldDef = {
        name: "Overworld",
        allowFilter: [],
        blockFilter: ['Spirit Temple'], // to prevent double counting of Mirror shield/Silver guantlets chest
        subCategories: [],
    }

    let areaBlocked = [];
    let allowed = [];
    if(separateGrottos){
        areaBlocked.push('Grottos');
        allowed.push('Grottos');
        overworldDef.subCategories.push({
            name: "Grottos",
            allowFilter: 'Grottos',
            blockFilter: [],
            subCategories:[],
        })
    }
    if(separateCows){
        areaBlocked.push('Cow');
        allowed.push('Cow');
        overworldDef.subCategories.push({
            name: "Cows",
            allowFilter: 'Cow',
            blockFilter: [],
            subCategories:[],
        })
    }
    if(separateShops){
        areaBlocked.push('Shops');
        allowed.push('Shops');
        overworldDef.subCategories.push({
            name: "Shops",
            allowFilter: 'Shops',
            blockFilter: [],
            subCategories:[],
        })
    }
    let sceneSubs = [];
    if(separateSkulls){
        sceneSubs.push({
            name: "Skulltulas",
            allowFilter: ['Skulltulas'],
            blockFilter:[],
            subCategories:[],
        })
    }
    for(let region in REGION_CATEGORIES){
        allowed.push(...REGION_CATEGORIES[region]);
        let requiresRegionDivision = divideRegions && REGION_CATEGORIES[region].length > 1;
        let regionDivisions = [];
        if(requiresRegionDivision){
            for(let scene of REGION_CATEGORIES[region]){
                regionDivisions.push({
                    name: scene,
                    allowFilter: scene,
                    blockFilter: areaBlocked,
                    subCategories: sceneSubs,
                })
            }
        }
        overworldDef.subCategories.push({
            name: region,
            allowFilter: REGION_CATEGORIES[region],
            blockFilter: areaBlocked,
            subCategories: requiresRegionDivision ? regionDivisions : sceneSubs,
        });
    }
    overworldDef.allowFilter = allowed;
    return overworldDef;
}

/**
 * 
 * @param {boolean} separateSkulls 
 * @returns 
 */
let buildDungeonDef = ( separateSkulls) => {
    /** @type {CategoryDef} */
    let dungeonDef = {
        name: "Dungeons",
        allowFilter: [],
        blockFilter: [],
        subCategories: [],
    }

    let allowed = [];
    let dungeonSubs = [];
    if(separateSkulls){
        dungeonSubs.push({
            name: "Skulltulas",
            allowFilter: ['Skulltulas'],
            blockFilter:[],
            subCategories:[],
        });
    }
    for(let dungeon of DUNGEON_CATEGORIES){
        allowed.push(dungeon);
        dungeonDef.subCategories.push({
            name: dungeon,
            allowFilter: dungeon,
            blockFilter:[],
            subCategories:dungeonSubs,
        });
    }
    dungeonDef.allowFilter = allowed;
    return dungeonDef;
}

export {Categories, buildDungeonDef, buildOverworldDef}