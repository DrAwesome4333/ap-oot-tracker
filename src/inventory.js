// @ts-check
/**
 * @typedef InventorySlot
 * @prop {(items:string[]) => void} addItems
 * @prop {() => void} reset
 * @prop {HTMLDivElement} div 
 */

/**
 * Creates an invetory slot designed to accept 1 item and display it, such as megaton hammer
 * @param {string} id name to give element
 * @param {string} name name for tooltip
 * @param {string} imageSrc url for image
 * @param {Set<string>} itemIds Accepted items that cause this to activate
 * @returns {InventorySlot} that cause this to light
 */
let singleSlot = (id, name, imageSrc, itemIds) => { 
    let hasInInventory = false;
    let div = document.createElement('div');
    div.id = id;
    div.title = name;
    div.classList.add('inventory_slot');
    div.classList.add('missing');

    let image = new Image();
    image.src = imageSrc;

    div.appendChild(image);

    let activate = () => {
        hasInInventory = true;
        div.classList.remove('missing');
    }
    /**
     * 
     * @param {string} item 
     */
    let addItem = (item) => {
        if(itemIds.has(item)){
            activate();
        }
    }
    /**
     * 
     * @param {string[]} items 
     */
    let addItems = (items) => {
        if(hasInInventory){
            return;
        }
        for(let i = 0; i < items.length; i++){
            addItem(items[i]);
        }
    }

    let reset = () => {
        hasInInventory = false;

    }

    return {
        addItems,
        reset,
        div,
    }
}

/**
 * Creates an invetory slot designed with text over the image, like a song
 * @param {string} id name to give element
 * @param {string} name name for tooltip
 * @param {string} text display text
 * @param {string} imageSrc url for image
 * @param {Set<string>} itemIds Accepted items that cause this to activate
 * @returns {InventorySlot} that cause this to light
 */
let singleSlotWithText = (id, name, text, imageSrc, itemIds) => { 
    let hasInInventory = false;
    let div = document.createElement('div');
    div.id = id;
    div.title = name;
    div.classList.add('inventory_slot');
    div.classList.add('missing');

    let image = new Image();
    image.src = imageSrc;

    div.appendChild(image);

    let textSpan = document.createElement('span');
    textSpan.textContent = text;
    div.appendChild(textSpan);

    let activate = () => {
        hasInInventory = true;
        div.classList.remove('missing');
    }
    /**
     * 
     * @param {string} item 
     */
    let addItem = (item) => {
        if(itemIds.has(item)){
            activate();
        }
    }
    /**
     * 
     * @param {string[]} items 
     */
    let addItems = (items) => {
        if(hasInInventory){
            return;
        }
        for(let i = 0; i < items.length; i++){
            addItem(items[i]);
        }
    }

    let reset = () => {
        hasInInventory = false;

    }

    return {
        addItems,
        reset,
        div,
    }
}

/**
 * Creates an invetory slot designed to accept multipe of one item, with a count of that item
 * @param {string} id name to give element
 * @param {string} name name for tooltip
 * @param {string} imageSrc url for image
 * @param {Set<string>} itemIds Accepted items that cause this to activate
 * @returns {InventorySlot} that cause this to light
 */
let countingSlot = (id, name, imageSrc, itemIds) => { 
    let itemCount = 0;
    let div = document.createElement('div');
    div.id = id;
    div.title = name;
    div.classList.add('inventory_slot');
    div.classList.add('missing');

    let image = new Image();
    image.src = imageSrc;

    div.appendChild(image);

    let textSpan = document.createElement('span');
    textSpan.textContent = '0';
    div.appendChild(textSpan);

    let activate = () => {
        div.classList.remove('missing');
    }
    /**
     * 
     * @param {string} item 
     */
    let addItem = (item) => {
        if(itemIds.has(item)){
            activate();
            itemCount++;
            textSpan.textContent = itemCount.toString();
        }
    }
    /**
     * 
     * @param {string[]} items 
     */
    let addItems = (items) => {
        for(let i = 0; i < items.length; i++){
            addItem(items[i]);
        }
    }

    let reset = () => {
        itemCount = 0;
        div.classList.add('missing');
    }

    return {
        addItems,
        reset,
        div,
    }
}


/**
 * Creates an invetory slot designed to accept items that may have varying effects on the count, like beans vs bean pack
 * @param {string} id name to give element
 * @param {string} name name for tooltip
 * @param {string} imageSrc url for image
 * @param {{itemsIds:Set<string>, value:Number}[]} itemValues Accepted items that cause this to activate
 * @returns {InventorySlot} that cause this to light
 */
let dynamicCountingSlot = (id, name, imageSrc, itemValues, initialValue=0, missingByDefault=true, roundMode='') => { 
    let itemCount = initialValue;
    let div = document.createElement('div');
    div.id = id;
    div.title = name;
    div.classList.add('inventory_slot');
    if(missingByDefault)
        div.classList.add('missing');

    let image = new Image();
    image.src = imageSrc;

    div.appendChild(image);

    let textSpan = document.createElement('span');
    let getItemCountAsString = () => {
        switch(roundMode){
            case 'up': return Math.ceil(itemCount).toString();
            case 'down': return Math.floor(itemCount).toString();
            case 'round': return Math.round(itemCount).toString();
            default: return itemCount.toString();
        }
    }
    textSpan.textContent = getItemCountAsString();
    div.appendChild(textSpan);

    let activate = () => {
        div.classList.remove('missing');
    }
    /**
     * 
     * @param {string} item 
     */
    let addItem = (item) => {
        for(let itemValue of itemValues){
            if(itemValue.itemsIds.has(item)){
                itemCount += itemValue.value;
                activate();
                textSpan.textContent = getItemCountAsString();
            }
        }
    }
    /**
     * 
     * @param {string[]} items 
     */
    let addItems = (items) => {
        for(let i = 0; i < items.length; i++){
            addItem(items[i]);
        }
    }

    let reset = () => {
        itemCount = initialValue;
        textSpan.textContent = getItemCountAsString();
        if(missingByDefault)
            div.classList.add('missing');
    }

    return {
        addItems,
        reset,
        div,
    }
}
/**
 * Creates an invetory slot designed to have mutiple images and text states, like the hookshot
 * @param {string} id name to give element
 * @param {string} name name for tooltip
 * @param {{imageSrc:string, text:string, maxCount:number}[]} states states to progress through
 * @param {Set<string>} itemIds Accepted items that cause this to activate
 * @returns {InventorySlot} that cause this to light
 */
let dynamicCountSlot = (id, name, states, itemIds, missingByDefault=true) => { 
    let itemCount = 0;
    let div = document.createElement('div');
    div.id = id;
    div.title = name;
    div.classList.add('inventory_slot');
    if(missingByDefault)
        div.classList.add('missing');

    let image = new Image();
    image.src = states[0].imageSrc;

    div.appendChild(image);

    let textSpan = document.createElement('span');
    textSpan.textContent = states[0].text;
    div.appendChild(textSpan);

    let refresh = () => {
        let stateIndex = 0;
        while(stateIndex < states.length && states[stateIndex].maxCount < itemCount){
            stateIndex++;
        }
        stateIndex = Math.min(stateIndex, states.length - 1);
        image.src = states[stateIndex].imageSrc;
        textSpan.textContent = states[stateIndex].text;
    }

    let activate = () => {
        div.classList.remove('missing');
    }
    /**
     * 
     * @param {string} item 
     */
    let addItem = (item) => {
        if(itemIds.has(item)){
            activate();
            itemCount++;
            refresh();
        }
    }
    /**
     * 
     * @param {string[]} items 
     */
    let addItems = (items) => {
        for(let i = 0; i < items.length; i++){
            addItem(items[i]);
        }
    }

    let reset = () => {
        itemCount = 0;
        if(missingByDefault)
            div.classList.add('missing');
        refresh();
    }

    return {
        addItems,
        reset,
        div,
    }
}

/**
 * Creates an invetory slot designed to have mutiple items placed in it, but an item of greator priority shows on top
 * @param {string} id name to give element
 * @param {string} name name for tooltip
 * @param {{imageSrc:string, text:string, showCount:boolean, itemIds:Set<string>, priority:number}[]} states states to progress through
 * @returns {InventorySlot} that cause this to light
 */
let multiItemSlot = (id, name, states, missingByDefault=true) => { 
    let itemCount = 0;
    let selectedState = 0;
    let div = document.createElement('div');
    div.id = id;
    div.title = name;
    div.classList.add('inventory_slot');
    if(missingByDefault)
        div.classList.add('missing');

    let image = new Image();
    image.src = states[0].imageSrc;

    div.appendChild(image);

    let textSpan = document.createElement('span');
    div.appendChild(textSpan);

    let refresh = () => {
        image.src = states[selectedState].imageSrc;
        if(states[selectedState].showCount){
            textSpan.textContent = itemCount.toString();
        }else{
            textSpan.textContent = states[selectedState].text;
        }
    }

    refresh();
    let activate = () => {
        div.classList.remove('missing');
    }
    /**
     * 
     * @param {string} item 
     */
    let addItem = (item) => {
        for(let s = 0; s < states.length; s++){
            let state = states[s];
            if(state.itemIds.has(item)){
                activate();
                itemCount++;
                if(state.priority >= states[selectedState].priority){
                    selectedState = s;
                }
                refresh();
            }
        }
        
    }
    /**
     * 
     * @param {string[]} items 
     */
    let addItems = (items) => {
        for(let i = 0; i < items.length; i++){
            addItem(items[i]);
        }
    }

    let reset = () => {
        itemCount = 0;
        if(missingByDefault)
            div.classList.add('missing');
        refresh();
    }

    return {
        addItems,
        reset,
        div,
    }
}

let Invetory = (() => {
    let div = document.createElement('div');
    div.id='inventory';
    /**
     * @type {Object<string, InventorySlot>}
     */
    const slots = {
        'boomerang': singleSlot('boomerang', 'Boomerang', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/d/d5/OoT_Boomerang_Icon.png', new Set(['Boomerang'])),
        'hammer': singleSlot('hammer', 'Megaton Hammer', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/93/OoT_Megaton_Hammer_Icon.png', new Set(['Megaton Hammer'])),
        'bombchus': singleSlot('bombchus', 'Bombchus', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/3/36/OoT_Bombchu_Icon.png', new Set(['Bombchus (10)','Bombchus (20)','Bombchus (5)', 'Bombchus'])),
        'lens': singleSlot('lens', 'Lens of Truth', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/0/05/OoT_Lens_of_Truth_Icon.png', new Set(['Lens of Truth'])),
        'dins': singleSlot('dins_fire', 'Din\'s Fire', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/d/da/OoT_Din%27s_Fire_Icon.png', new Set(['Dins Fire'])),
        'farores': singleSlot('farores_wind', 'Farore\'s Wind', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/7/7a/OoT_Farore%27s_Wind_Icon.png', new Set(['Farores Wind'])),
        'nayrus': singleSlot('nayrus_love', 'Nayru\'s Love', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/b/be/OoT_Nayru%27s_Love_Icon.png', new Set(['Nayrus Love'])),
        'fire_arrows': singleSlot('fire_arrows', 'Fire Arrows', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/1/1e/OoT_Fire_Arrow_Icon.png', new Set(['Fire Arrows'])),
        'ice_arrows': singleSlot('ice_arrows', 'Ice Arrows', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/3/3c/OoT_Ice_Arrow_Icon.png', new Set(['Ice Arrows'])),
        'light_arrows': singleSlot('light_arrows', 'Light Arrows', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/7/76/OoT_Light_Arrow_Icon.png', new Set(['Light Arrows'])),
        'kokiri_sword': singleSlot('kokiri_sword', 'Kokiri Sword', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/5/53/OoT_Kokiri_Sword_Icon.png', new Set(['Kokiri Sword'])),
        'mirror_shield': singleSlot('mirror_shield', 'Mirror Shield', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/b/b0/OoT_Mirror_Shield_Icon_2.png', new Set(['Mirror Shield'])),
        'goron_tunic': singleSlot('goron_tunic', 'Goron Tunic', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/1/1c/OoT_Goron_Tunic_Icon.png', new Set(['Goron Tunic'])),
        'zora_tunic': singleSlot('zora_tunic', 'Zora Tunic', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/2c/OoT_Zora_Tunic_Icon.png', new Set(['Zora Tunic'])),
        'hover_boots': singleSlot('hover_boots', 'Hover Boots', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/22/OoT_Hover_Boots_Icon.png', new Set(['Hover Boots'])),
        'iron_boots': singleSlot('iron_boots', 'Iron Boots', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/3/34/OoT_Iron_Boots_Icon.png', new Set(['Iron Boots'])),
        'gerudo_card': singleSlot('membership_card', 'Gerudo Membership Card', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/4e/OoT_Gerudo_Token_Icon.png', new Set(['Gerudo Membership Card'])),
        
        'zeldas_lullaby': singleSlotWithText('zeldas_lullaby', 'Zelda\'s Lullaby', 'Zelda', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/21/Grey_Note.png', new Set(['Zeldas Lullaby'])),
        'eponas_song': singleSlotWithText('eponas_song', 'Epona\'s Song', 'Epona', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/21/Grey_Note.png', new Set(['Eponas Song'])),
        'sarias_song': singleSlotWithText('sarias_song', 'Saria\'s Song', 'Saria', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/21/Grey_Note.png', new Set(['Sarias Song'])),
        'suns_song': singleSlotWithText('suns_song', 'Sun\'s Song', 'Sun', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/21/Grey_Note.png', new Set(['Suns Song'])),
        'song_of_time': singleSlotWithText('song_of_time', 'Song of Time', 'Time', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/21/Grey_Note.png', new Set(['Song of Time'])),
        'song_of_storms': singleSlotWithText('song_of_storms', 'Song of Storms', 'Storms', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/21/Grey_Note.png', new Set(['Song of Storms'])),
        'minuet': singleSlotWithText('minuet', 'Minuet of Forest', 'Min', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/e/e4/Green_Note.png', new Set(['Minuet of Forest'])),
        'bolero': singleSlotWithText('bolero', 'Bolero of Fire', 'Bol', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/f/f0/Red_Note.png', new Set(['Bolero of Fire'])),
        'serenade': singleSlotWithText('serenade', 'Serendade of Water', 'Ser', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/0/0f/Blue_Note.png', new Set(['Serenade of Water'])),
        'requiem': singleSlotWithText('requiem', 'Requiem of Spirit', 'Req', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/a/a4/Orange_Note.png', new Set(['Requiem of Spirit'])),
        'nocturne': singleSlotWithText('nocturne', 'Nocturne of Shadow', 'Noc', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/97/Purple_Note.png', new Set(['Nocturne of Shadow'])),
        'prelude': singleSlotWithText('prelude', 'Prelude of Light', 'Pre', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/90/Yellow_Note.png', new Set(['Prelude of Light'])),
        
        'gold_skulltula_tokens': countingSlot('gold_skulltula_tokens', 'Gold Skulltula Tokens', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/47/OoT_Token_Icon.png', new Set(['Gold Skulltula Token'])),
        'hearts': dynamicCountingSlot('hearts', 'Full Hearts', 
        'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/5/5a/OoT_Heart_Container_Icon.png', [
            {
                itemsIds:new Set(['Heart Container']),
                value: 1
            },{
                itemsIds:new Set(['Piece of Heart (Treasure Chest Game)','Piece of Heart']),
                value: 0.25
            },
        ], 3, false, 'down'),
        
        'deku_stick': dynamicCountSlot('deku_stick', 'Deku Stick Capacity', 
            [{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/2f/OoT_Deku_Stick_Icon.png",
                maxCount: 0,
                text: '10'
            }, {
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/2f/OoT_Deku_Stick_Icon.png",
                maxCount: 1,
                text: '20'
            },{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/2f/OoT_Deku_Stick_Icon.png",
                maxCount: 2,
                text: '30'
            }], 
        new Set(['Deku Stick Capacity']), false),

        'deku_nut': dynamicCountSlot('deku_nut', 'Deku Nut Capacity', 
            [{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/d/db/OoT_Deku_Nut_Icon.png",
                maxCount: 0,
                text: '20'
            }, {
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/d/db/OoT_Deku_Nut_Icon.png",
                maxCount: 1,
                text: '30'
            },{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/d/db/OoT_Deku_Nut_Icon.png",
                maxCount: 2,
                text: '40'
            }], 
        new Set(['Deku Nut Capacity']), false),

        'bow': dynamicCountSlot('bow', 'Fairy Bow', 
            [{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/9a/OoT_Fairy_Bow_Icon.png",
                maxCount: 0,
                text: ''
            },{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/9a/OoT_Fairy_Bow_Icon.png",
                maxCount: 1,
                text: '20'
            }, {
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/9a/OoT_Fairy_Bow_Icon.png",
                maxCount: 2,
                text: '30'
            },{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/9a/OoT_Fairy_Bow_Icon.png",
                maxCount: 3,
                text: '40'
            }], 
        new Set(['Bow'])),

        'slingshot': dynamicCountSlot('slingshot', 'Slingshot', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/3/32/OoT_Fairy_Slingshot_Icon.png",
            maxCount: 0,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/3/32/OoT_Fairy_Slingshot_Icon.png",
            maxCount: 1,
            text: '30'
        }, {
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/3/32/OoT_Fairy_Slingshot_Icon.png",
            maxCount: 2,
            text: '40'
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/3/32/OoT_Fairy_Slingshot_Icon.png",
            maxCount: 3,
            text: '50'
        }], 
        new Set(['Slingshot'])),

        'hookshot': dynamicCountSlot('hookshot', 'Progressive Hookshot', 
            [{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/7/77/OoT_Hookshot_Icon.png",
                maxCount: 0,
                text: ''
            },{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/7/77/OoT_Hookshot_Icon.png",
                maxCount: 1,
                text: 'H'
            }, {
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/a/a4/OoT_Longshot_Icon.png",
                maxCount: 2,
                text: 'L'
            }], 
            new Set(['Progressive Hookshot'])),

        'ocarina': dynamicCountSlot('ocarina', 'Ocarina', 
            [{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/97/OoT_Fairy_Ocarina_Icon.png",
                maxCount: 0,
                text: ''
            },{
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/97/OoT_Fairy_Ocarina_Icon.png",
                maxCount: 1,
                text: ''
            }, {
                imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/4e/OoT_Ocarina_of_Time_Icon.png",
                maxCount: 2,
                text: ''
            }], 
            new Set(['Ocarina'])),

        'strength': dynamicCountSlot('strength', 'Progressive Strength', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/b/b7/OoT_Goron%27s_Bracelet_Icon.png",
            maxCount: 0,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/b/b7/OoT_Goron%27s_Bracelet_Icon.png",
            maxCount: 1,
            text: ''
        }, {
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/b/b9/OoT_Silver_Gauntlets_Icon.png",
            maxCount: 2,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/6/6a/OoT_Golden_Gauntlets_Icon.png",
            maxCount: 3,
            text: ''
        }], 
        new Set(['Progressive Strength Upgrade'])),

        'bomb_bag': dynamicCountSlot('bomb_bag', 'Bomb Bag', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/1/11/OoT_Bomb_Icon.png",
            maxCount: 0,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/1/11/OoT_Bomb_Icon.png",
            maxCount: 1,
            text: '20'
        }, {
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/1/11/OoT_Bomb_Icon.png",
            maxCount: 2,
            text: '30'
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/1/11/OoT_Bomb_Icon.png",
            maxCount: 3,
            text: '40'
        }], 
        new Set(['Bomb Bag'])),

        'magic_meter': dynamicCountSlot('magic_meter', 'Magic Meter', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/9f/OoT3D_Magic_Jar_Icon.png",
            maxCount: 0,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/9f/OoT3D_Magic_Jar_Icon.png",
            maxCount: 1,
            text: ''
        }, {
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/9f/OoT3D_Magic_Jar_Icon.png",
            maxCount: 2,
            text: 'x2'
        }], 
        new Set(['Magic Meter'])),

        'bottle': multiItemSlot('bottle', 'Bottles', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/f/fc/OoT_Bottle_Icon.png",
            itemIds: new Set(['Bottle with Red Potion', 'Bottle with Green Potion','Bottle with Blue Potion', 'Bottle with Fairy', 
            'Bottle with Fish', 'Bottle with Blue Fire', 'Bottle with Bugs', 'Bottle with Big Poe', 'Bottle with Poe','Bottle',
            'Bottle with Milk']),
            showCount: true,
            priority: 1,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/21/OoT_Letter_Icon.png",
            itemIds: new Set(['Rutos Letter']),
            showCount: true,
            priority: 2,
            text: ''
        }]),

        'biggoron_sword': multiItemSlot('biggoron_sword', 'Giant\'s Knife/Biggoron Sword', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/2e/OoT_Giant%27s_Knife_Icon.png",
            itemIds: new Set([]),
            showCount: false,
            priority: 0,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/2e/OoT_Giant%27s_Knife_Icon.png",
            itemIds: new Set(['Giants Knife']),
            showCount: false,
            priority: 1,
            text: 'Kinfe'
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/2e/OoT_Giant%27s_Knife_Icon.png",
            itemIds: new Set(['Biggoron Sword']),
            showCount: false,
            priority: 2,
            text: 'BGS'
        }]),
        
        'wallet': dynamicCountSlot('wallet', 'Progressive Wallet', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/f/f9/OoT_Adult%27s_Wallet_Icon.png",
            maxCount: 0,
            text: '99'
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/f/f9/OoT_Adult%27s_Wallet_Icon.png",
            maxCount: 1,
            text: '200'
        }, {
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/8/87/OoT_Giant%27s_Wallet_Icon.png",
            maxCount: 2,
            text: '500'
        }, {
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/8/87/OoT_Giant%27s_Wallet_Icon.png",
            maxCount: 3,
            text: '999'
        }], 
        new Set(['Progressive Wallet'])),

        'scale': dynamicCountSlot('scale', 'Progressive Scale', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/4e/OoT_Silver_Scale_Icon.png",
            maxCount: 0,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/4e/OoT_Silver_Scale_Icon.png",
            maxCount: 1,
            text: ''
        }, {
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/9/95/OoT_Golden_Scale_Icon.png",
            maxCount: 2,
            text: ''
        }, ], 
        new Set(['Progressive Scale'])),

        'magic_beans': dynamicCountingSlot('magic_beans', 'Magic Beans', 
        'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/a/a7/OoT_Magic_Bean_Icon.png', [
            {
                itemsIds:new Set(['Magic Bean']),
                value: 1
            },{
                itemsIds:new Set(['Magic Bean Pack']),
                value: 10
            },
        ]),
        'adult_trade': multiItemSlot('adult_trade', 'Adult Trade Item', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/0/09/OoT_Weird_Egg_Icon.png",
            itemIds: new Set(['Pocket Egg']),
            showCount: false,
            priority: 1,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/1/17/OoT_Cucco_Icon.png",
            itemIds: new Set(['Pocket Cucco']),
            showCount: false,
            priority: 2,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/c/c8/OoT_Cojiro_Icon.png",
            itemIds: new Set(['Cojiro']),
            showCount: false,
            priority: 3,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/a/af/OoT_Odd_Mushroom_Icon.png",
            itemIds: new Set(['Odd Mushroom']),
            showCount: false,
            priority: 4,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/5/5b/OoT_Odd_Potion_Icon.png",
            itemIds: new Set([ 'Odd Potion']),
            showCount: false,
            priority: 5,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/a/a5/OoT_Poacher%27s_Saw_Icon.png",
            itemIds: new Set(['Poachers Saw']),
            showCount: false,
            priority: 6,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/c/cc/OoT_Broken_Goron%27s_Sword_Icon.png",
            itemIds: new Set(['Broken Sword']),
            showCount: false,
            priority: 7,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/44/OoT_Prescription_Icon.png",
            itemIds: new Set(['Prescription']),
            showCount: false,
            priority: 8,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/c/ca/OoT_Eyeball_Frog_Icon.png",
            itemIds: new Set(['Eyeball Frog']),
            showCount: false,
            priority: 9,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/0/0b/OoT_World%27s_Finest_Eye_Drops_Icon.png",
            itemIds: new Set(['Eyedrops']),
            showCount: false,
            priority: 10,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/1/11/OoT_Claim_Check_Icon.png",
            itemIds: new Set(['Claim Check']),
            showCount: false,
            priority: 11,
            text: ''
        }]),

        'child_trade': multiItemSlot('child_trade', 'Child Trade Item', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/0/09/OoT_Weird_Egg_Icon.png",
            itemIds: new Set(['Weird Egg']),
            showCount: false,
            priority: 1,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/1/17/OoT_Cucco_Icon.png",
            itemIds: new Set([]),
            showCount: false,
            priority: 2,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/2/20/OoT_Zelda%27s_Letter_Icon.png",
            itemIds: new Set(['Zeldas Letter']),
            showCount: false,
            priority: 3,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/a/a9/OoT_Keaton_Mask_Icon.png",
            itemIds: new Set(['Keaton Mask']),
            showCount: false,
            priority: 4,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/5/5c/OoT_Spooky_Mask_Icon.png",
            itemIds: new Set(['Spooky Mask']),
            showCount: false,
            priority: 4,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/7/7b/OoT_Bunny_Hood_Icon.png",
            itemIds: new Set(['Bunny Hood']),
            showCount: false,
            priority: 4,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/d/df/OoT_Skull_Mask_Icon.png",
            itemIds: new Set(['Skull Mask']),
            showCount: false,
            priority: 4,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/c/ce/OoT_Mask_of_Truth_Icon.png",
            itemIds: new Set(['Mask of Truth']),
            showCount: false,
            priority: 4,
            text: ''
        },]),
        'triforce': multiItemSlot('triforce', 'Triforce', 
        [{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/0/0b/SS_Triforce_Piece_Icon.png",
            itemIds: new Set([]),
            showCount: false,
            priority: 0,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/0/0b/SS_Triforce_Piece_Icon.png",
            itemIds: new Set(['Triforce Piece']),
            showCount: true,
            priority: 1,
            text: ''
        },{
            imageSrc:"https://static.wikia.nocookie.net/zelda_gamepedia_en/images/6/68/ALttP_Triforce_Title_Sprite.png",
            itemIds: new Set([]),
            showCount: false,
            priority: 2,
            text: ''
        }]),
        'forest_boss_key': singleSlotWithText('forest_boss_key', 'Boss Key (Forest Temple)', 'Forest', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/40/OoT_Boss_Key_Icon.png', new Set(['Boss Key (Forest Temple)'])),
        'fire_boss_key': singleSlotWithText('fire_boss_key', 'Boss Key (Fire Temple)', 'Fire','https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/40/OoT_Boss_Key_Icon.png', new Set(['Boss Key (Fire Temple)'])),
        'water_boss_key': singleSlotWithText('water_boss_key', 'Boss Key (Water Temple)', 'Water','https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/40/OoT_Boss_Key_Icon.png', new Set(['Boss Key (Water Temple)'])),
        'shadow_boss_key': singleSlotWithText('shadow_boss_key', 'Boss Key (Shadow Temple)', 'Shadow', 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/40/OoT_Boss_Key_Icon.png', new Set(['Boss Key (Shadow Temple)'])),
        'spirit_boss_key': singleSlotWithText('spirit_boss_key', 'Boss Key (Spirit Temple)', 'Spirit','https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/40/OoT_Boss_Key_Icon.png', new Set(['Boss Key (Spirit Temple)'])),
        'ganon_boss_key': singleSlotWithText('ganon_boss_key', 'Boss Key (Ganons Castle)', 'Ganon','https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/40/OoT_Boss_Key_Icon.png', new Set(['Boss Key (Ganons Castle)'])),

    }//https://static.wikia.nocookie.net/zelda_gamepedia_en/images/4/40/OoT_Boss_Key_Icon.png

    let buildInventory = () => {
        for(let slot in slots){
            div.appendChild(slots[slot].div);
        }
    }

    buildInventory();

    let reset = () => {
        for(let slot in slots){
            slots[slot].reset();
        }
    }

    /**
     * 
     * @param {string[]} items 
     */
    let addItems = (items) => {
        for(let slot in slots){
            slots[slot].addItems(items);
        }
        console.log(items)
    }



    return {
        reset,
        div,
        addItems,
    }
})()

export {Invetory}