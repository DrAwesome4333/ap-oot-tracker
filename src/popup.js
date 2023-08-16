// @ts-check
let popupIdGenerator = (() => {
    let nextId = 1;
    return {
        get next(){return `popup_${nextId++}`}
    }
})();

/**
 * @enum {number}
 */
const POPUP_TYPE = {
    NONE: -1,
    INFO: 0,
    ERROR: 1,
    SUCCESS: 2,
}
let Popups = (()=>{
    const POP_UP_DURATION_MS = 10_000;
    const POP_UP_HEIGHT = 85;
    const POP_UP_LAYER = document.createElement('div');
    document.body.appendChild(POP_UP_LAYER);
    POP_UP_LAYER.id = 'pop_up_layer';
    let activePopups = new Map();
    /**
     * 
     * @param {POPUP_TYPE} type 
     * @param {string} message 
     */
    let createPopup = (type, message) => {
        const popupID = popupIdGenerator.next;
        let popup = document.createElement('div');
        popup.id = popupID;
        popup.classList.add('pop_up_container');

        let msgElement = document.createElement('div');
        msgElement.classList.add('pop_up_message');
        msgElement.innerHTML = message;

        let imgElement = document.createElement('span');
        imgElement.classList.add('pop_up_image');
        imgElement.innerHTML = 'ⓘ';

        popup.appendChild(msgElement);
        popup.appendChild(imgElement);
        switch(type){
            case POPUP_TYPE.ERROR: {
                popup.classList.add('error');
                imgElement.innerHTML = '⚠️';
                break;
            }
            case POPUP_TYPE.INFO: {
                popup.classList.add('info');
                break;
            }
            case POPUP_TYPE.SUCCESS: {
                imgElement.innerHTML = '✅';
                popup.classList.add('success');
                break;
            }
        }
        POP_UP_LAYER.appendChild(popup);
        setTimeout(()=>{popup.style.right = '10px';}, 1)
        for(let otherPopup of activePopups.values()){
            otherPopup.bottom += POP_UP_HEIGHT;
            otherPopup.popup.style.bottom = `${otherPopup.bottom}px`;
        }

        let popupItem = {
            popup,
            bottom: 10,
        };
        activePopups.set(popupID, popupItem)
        setTimeout(()=>{
            popup.style.opacity = '0';
            setTimeout(()=>{popup.remove(); activePopups.delete(popupID)}, 1000);
        }, POP_UP_DURATION_MS)
        
    }
    return {
        createPopup
    }
})()

export {Popups, POPUP_TYPE};