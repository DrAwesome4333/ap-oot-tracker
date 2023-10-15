// @ts-check
/**
 * @typedef InventoryDef
 * @prop {string} [background_color]
 * @prop {number} rows
 * @prop {number} columns
 * @prop {Object.<string, string>} images
 * @prop {Object.<string, InventorySlotDef>} slots
 * @prop {Object.<string, InventorySubsectionDef>} [subsections]
 */
/**
 * @typedef InventoryItemDef
 * @prop {number} value
 * @prop {boolean} [is_item_group] Defaults to false
 */
/**
 * @typedef InventorySlotDef
 * @prop {number} row
 * @prop {number} column
 * @prop {number}[starting_count]
 * @prop {string} starting_state
 * @prop {Object.<string, InventoryItemDef>} items
 * @prop {Object.<string, InventoryStateDef>} states
 * 
 */
/**
 * @typedef InventoryStateDef
 * @prop {string} image
 * @prop {string} [text]
 * @prop {string} tool_tip
 * @prop {string[]} styles
 * @prop {"count" | "text"} text_mode
 * @prop {"up"|"down"|"default"} [rounding_mode]
 * @prop {number} priority
 * @prop {InventorySlotConditionDef} condition 
 *  
 */
/**
 * @typedef InventorySlotConditionDef
 * @prop {"always"|"item"|"count"} type
 * @prop {number} [less_than]
 * @prop {number} [less_than_equal]
 * @prop {number} [equal]
 * @prop {number} [greater_than]
 * @prop {number} [greater_than_equal]
 * @prop {string[]}[items]
 * @prop {string[]}[item_groups]
 * 
 */
/**
 * @typedef InventorySubsectionDef
 * @prop {number} row
 * @prop {number} row_span
 * @prop {number} column
 * @prop {number} column_span
 * @prop {string} [label]
 * @prop {string[]} slots
 *  
 */
import { Client } from "archipelago.js";

/** @type {Object.<string,InventoryDef>} */
let testJSON = await fetch("./data/inventory/OOT_inventory.json").then(r => r.json());

/**
 * @typedef InventorySlot
 * @prop {(items:import("archipelago.js").NetworkItem[]) => void} addItems
 * @prop {() => void} reset
 * @prop {HTMLDivElement} div 
 */

/**
 * @typedef InventorySection
 * @prop {(items:import("archipelago.js").NetworkItem[]) => void} addItems
 * @prop {() => void} reset
 * @prop {HTMLDivElement} div 
 */

let elementIdGen = (()=>{
    let n = 1;
    return {
        get next(){return `id_${n++}`;}
    }
})()
/**
 * 
 * @param {Object.<string,InventoryDef>} def
 * @param {Client} client
 */
let createInventory = (def, client) => {
    let gameName = client.players.game(client.data.slot);
    /** @type {InventorySection[]}*/
    let sections = [];
    /** 
     * @param {InventoryDef} sectionDef
     * @param {string} name
    */
    let createInventorySection = (name, sectionDef) => {
        /**
         * 
         * @param {InventorySlotDef} slotDef 
         */
        let createInventorySlot = (slotDef) => {
            // Build DOM Elements
            let slotContainer = document.createElement('div');
            slotContainer.classList.add('inventory_slot');
            slotContainer.style.gridRow = slotDef.row.toString();
            slotContainer.style.gridColumn = slotDef.column.toString();

            let slotImage = new Image();
            let slotText = document.createElement('span');

            slotContainer.appendChild(slotImage);
            slotContainer.appendChild(slotText);
            
            inventorySlotContainer.appendChild(slotContainer);
            // Load item settings
            let itemCount = slotDef.starting_count || 0;
            /** @type {Map<string, number>} */
            let triggerItems = new Map();

            let collectedItems = new Set();
            for(let item in slotDef.items){
                let details = slotDef.items[item];
                if(details.is_item_group){
                    let itemsInGroup = client.items.group(gameName, item);
                    itemsInGroup.forEach(itemName => triggerItems.set(itemName, details.value));
                }else{
                    triggerItems.set(item, details.value);
                }
            }

            let currentState = slotDef.starting_state;
            /**
             * 
             * @param {import("archipelago.js").NetworkItem[]} items 
             */
            let addItems = (items) => {
                let hasTriggered = false;
                for(let i = 0; i < items.length; i++){
                    let item = items[i];
                    let itemName = client.items.name(gameName, item.item);
                    if(triggerItems.has(itemName)){
                        itemCount += triggerItems.get(itemName) || 0;
                        collectedItems.add(itemName)
                        hasTriggered = true;
                    }
                }
                if(hasTriggered){
                    selectState();
                    renderState();
                }
            }

            let selectState = () => {
                let selectedState = slotDef.starting_state;
                let currentPriority = slotDef.states[selectedState].priority;
                let stateNames = Object.getOwnPropertyNames(slotDef.states);
                stateNames.forEach(stateName => {
                    let state = slotDef.states[stateName];
                    let setState = () => {
                        currentPriority = state.priority;
                        selectedState = stateName;
                    }
                    if(state.priority < currentPriority){
                        return; // just go to the next element
                    }
                    
                    switch(state.condition.type){
                        case "always": {
                            setState();
                            break;
                        }
                        case "item":{
                            if(state.condition.items){
                                state.condition.items.forEach(item => {
                                    if(collectedItems.has(item)){
                                        setState();
                                    }
                                })
                            } else if (state.condition.item_groups){
                                state.condition.item_groups.forEach(groupName => {
                                    let items = client.items.group(gameName, groupName);
                                    items.forEach(item => {
                                        if(collectedItems.has(item)){
                                            setState();
                                        }
                                    })
                                });
                                
                            }
                            break;
                        }
                        case "count":{
                            let hasFailed = false;
                            if(state.condition.hasOwnProperty('equal') && !(itemCount == state.condition.equal)){
                                hasFailed = true;
                            }
                            // @ts-ignore The property is checked if it exists right before
                            if(state.condition.hasOwnProperty('greater_than') && !(itemCount > state.condition.greater_than)){
                                hasFailed = true;
                            }
                            // @ts-ignore The property is checked if it exists right before
                            if(state.condition.hasOwnProperty('greater_than_equal') && !(itemCount >= state.condition.greater_than_equal)){
                                hasFailed = true;
                            }
                            // @ts-ignore The property is checked if it exists right before
                            if(state.condition.hasOwnProperty('less_than') && !(itemCount < state.condition.less_than)){
                                hasFailed = true;
                            }
                            // @ts-ignore The property is checked if it exists right before
                            if(state.condition.hasOwnProperty('less_than_equal') && !(itemCount <= state.condition.less_than_equal)){
                                hasFailed = true;
                            }
                            if(!hasFailed){
                                setState();
                            }
                            break;
                        }
                    }
                })
                currentState = selectedState;
            }

            let renderState = () => {
                let state = slotDef.states[currentState];
                if(state.image){
                    slotImage.src = images.get(state.image)?.src || ""
                }
                slotContainer.className = 'inventory_slot';
                if(state.styles.length > 0)
                    slotContainer.classList.add(...state.styles);
                slotContainer.title = state.tool_tip;
                switch(state.text_mode){
                    case "count": {
                        if(state.rounding_mode){
                            switch(state.rounding_mode){
                                case "up":{
                                    slotText.innerText = Math.ceil(itemCount).toString();
                                    break;
                                }
                                case "down":{
                                    slotText.innerText = Math.floor(itemCount).toString();
                                    break;
                                }
                                default: {
                                    slotText.innerText = Math.round(itemCount).toString();
                                    break;
                                }
                            }
                        }else{
                            slotText.innerText = itemCount.toString();
                        }
                        break;
                    }
                    case "text": {
                        slotText.innerText = state.text || "";
                    }
                }
            }

            let reset = () => {
                currentState = slotDef.starting_state;
                collectedItems = new Set();
                itemCount = slotDef.starting_count || 0;
                renderState();
            }

            renderState();

            return {
                addItems,
                reset,
                div: slotContainer,
            }
        }

        let container = document.createElement('div');
        container.style.backgroundColor = sectionDef.background_color || "#020202";
        container.classList.add('inventory_wrapper');
        // let title = document.createElement('h4');
        // title.innerText = name;
        // container.appendChild(title);
        let inventorySlotContainer = document.createElement('div');
        inventorySlotContainer.classList.add('inventory')
        inventorySlotContainer.style.gridTemplateColumns = `repeat(${sectionDef.columns}, auto)`
        inventorySlotContainer.style.gridTemplateRows = `repeat(${sectionDef.rows}, auto)`
        container.appendChild(inventorySlotContainer);
        // Load images
        /** @type {Map<string, HTMLImageElement>} */
        let images = new Map();
        let imageNames = Object.getOwnPropertyNames(sectionDef.images);
        for(let i = 0; i < imageNames.length; i++){
            let imageName = imageNames[i];
            let image = new Image();
            image.src = sectionDef.images[imageName];
            images.set(imageName, image)
        }

        // Create Slots
        /** @type {Map<string, InventorySlot>} */
        let slots = new Map();
        let slotNames = Object.getOwnPropertyNames(sectionDef.slots);
        for(let s = 0; s < slotNames.length; s++){
            let slotName = slotNames[s];
            let slotDef = sectionDef.slots[slotName];
            let slot = createInventorySlot(slotDef);
            slots.set(slotName, slot);
        }

        // setup sub sections
        if(sectionDef.subsections){
            let subsectionNames = Object.getOwnPropertyNames(sectionDef.subsections);
            for(let s = 0; s < subsectionNames.length; s++){
                let subSecDef = sectionDef.subsections[subsectionNames[s]];
                let subsectionContainer = document.createElement('div');
                subsectionContainer.classList.add("inventory_subsection");
                subsectionContainer.style.gridRowStart = subSecDef.row.toString();
                subsectionContainer.style.gridColumnStart = subSecDef.column.toString();
                subsectionContainer.style.gridRowEnd = (subSecDef.row + subSecDef.row_span).toString();
                subsectionContainer.style.gridColumnEnd = (subSecDef.column + subSecDef.column_span).toString();

                inventorySlotContainer.appendChild(subsectionContainer);

                subSecDef.slots.forEach(slotName => {
                    let slot = slots.get(slotName);
                    if(slot){
                        subsectionContainer.appendChild(slot.div);
                    }
                });
                if(subSecDef.label){
                    let label = document.createElement('span');
                    label.innerText = subSecDef.label;
                    subsectionContainer.appendChild(label);
                }
            }
        }
        /**
         * 
        * @param {import("archipelago.js").NetworkItem[]} items 
        */
        let addItems = (items) => {
            slots.forEach(slot => {
                slot.addItems(items);
            });
        }

        let reset = () => {
            slots.forEach(slot => {
                slot.reset();
            });
        }

        
        return {
            addItems,
            reset,
            div: container,
        }
    }

    Object.getOwnPropertyNames(def).forEach(name => {
        sections.push(createInventorySection(name, def[name]));
    })
    /**
     * @param {import("archipelago.js").NetworkItem[]} items
     */
    let addItems = (items) => {
        sections.forEach(section => {
            section.addItems(items);
        })
    }

    let reset = () => {
        sections.forEach(section => {
            section.reset();
        })
    }

    return {
        reset,
        addItems,
        sections,
    }
}

let Invetory = (() => {
    let div = document.createElement('div');
    div.id='inventory';
    /** @type {{reset:()=>void, addItems:(items:import("archipelago.js").NetworkItem[])=>void, sections:InventorySection[]} | null} */
    let inventorySlots = null;
    /** @type {import("archipelago.js").NetworkItem[]} */
    let inventory = [];

    /**
     * 
     * @param {Client} client 
     */
    let build = (client) => {
        inventorySlots = createInventory(testJSON, client);
        while(div.firstChild){
            div.firstChild.remove();
        }
        inventorySlots.sections.forEach(section => {
            div.appendChild(section.div);
        })
        inventorySlots.addItems(inventory); 
        
    }

    let reset = () => {
        if(inventorySlots){
            inventorySlots.sections.forEach(section => {
                section.reset();
            });
        }
        inventory = [];
    }

    /**
     * 
     * @param {import("archipelago.js").NetworkItem[]} items 
     */
    let addItems = (items) => {
        if(inventorySlots){
            inventorySlots.sections.forEach(section => {
                section.addItems(items);
            })
        }
        items.forEach(item => {
            inventory.push(item);
        })
    }



    return {
        reset,
        div,
        addItems,
        build,
    }
})()

export {Invetory}