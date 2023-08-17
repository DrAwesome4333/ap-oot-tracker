// @ts-check
/**
 * @typedef Category
 * @prop {string} name
 * @prop {Category[]} subCategories
 * @prop {Set<string>} locations
 * @prop {Set<string>} allowFilter
 * @prop {Set<string>} blockFilter
 * @prop {Set<string>} unclaimedLocations // Locations not claimed by any sub categories
 * @prop {Set<string>} [checkedLocations]
 * @prop {Number} checkedCount
 */

import { DUNGEON_CATEGORIES, LOCATION_DATA, REGION_CATEGORIES } from "./locations.js";

/**
 * @typedef CategoryDef
 * @prop {string} name
 * @prop {string | string[]} allowFilter
 * @prop {string | string[]} blockFilter
 * @prop {CategoryDef[]} subCategories
 */

let Categories = (() => {

    /**
     * @param {CategoryDef} categoryDef
     * @returns {Category}
     */
    let buildCategory = (categoryDef) => {
        let locations = new Set();
        let unclaimedLocations = new Set();
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
            get checkedCount () {
                let count = 0;
                if(this.checkedLocations){
                    for(let location of locations.values()){
                        if(this.checkedLocations.has(location)){
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
     * @param {Set<String>} locations 
     * @param {Set<String>} checkedLocations
     */
    let populateCategory = (category, locations, checkedLocations) => {
        category.checkedLocations = checkedLocations;
        for(let location of locations.values()){
            let wasBlocked = false;
            let locationCategories = LOCATION_DATA[location].categories;
            for(let locationCategory of locationCategories.values()){
                if(category.blockFilter.has(locationCategory)){
                    wasBlocked = true;
                    break;
                }
            }
            if(wasBlocked){
                continue;
            }
            for(let locationCategory of locationCategories.values()){
                if(category.allowFilter.has(locationCategory)){
                    category.locations.add(location);
                    category.unclaimedLocations.add(location);
                    break;
                }
            }
        }
        for(let i = 0; i < category.subCategories.length; i++){
            populateCategory(category.subCategories[i], category.locations, checkedLocations);
            for(let location of category.subCategories[i].locations.values()){
                category.unclaimedLocations.delete(location);
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
        container.appendChild(title);
        container.appendChild(list);
        title.addEventListener('click', ()=>{
            if(title.nextElementSibling){
                title.nextElementSibling.classList.toggle('hidden');
                title.classList.toggle('hidden_content');
            }
        })
        for(let location of category.unclaimedLocations.values()){
            let item = document.createElement('li');
            item.innerText = location;
            item.classList.add('check')
            if(category.checkedLocations?.has(location)){
                item.classList.add('checked')
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
    return {
        populateCategory,
        buildCategory,
        renderCategory,
    }
})();

/**
 * 
 * @param {boolean} separateGrottos 
 * @param {boolean} separateSkulls 
 * @param {boolean} separateCows 
 * @param {boolean} separateShops 
 */
let buildOverworldDef = (separateGrottos, separateSkulls, separateCows, separateShops) => {
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
        overworldDef.subCategories.push({
            name: region,
            allowFilter: REGION_CATEGORIES[region],
            blockFilter: areaBlocked,
            subCategories:sceneSubs,
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