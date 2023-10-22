// @ts-check
import { Screens } from "./screen.js";
import { Popups, POPUP_TYPE} from "./popup.js";
import { Checklist } from "./checklist.js";
import { GameView } from "./gameScreen.js"
import { GameData } from "./gameData.js";
let generateId = (() => {
    let nextIdNumber = 0;
    return {
        get next(){
            return `generatedId_${nextIdNumber}` 
        }
    }
})()

/**
 * 
 * @param {string} lableHTML 
 * @param {string} [inputId] 
 */
let createTextInputWithLabel = (lableHTML, inputId=generateId.next, gridRow=0) => {
    let inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.id = inputId;
    inputElement.style.gridRow = gridRow.toString();
    let inputLabel = document.createElement('label');
    inputLabel.id = `label_${inputId}`;
    inputLabel.innerHTML = lableHTML;
    inputLabel.htmlFor = inputId;
    inputLabel.style.gridRow = gridRow.toString();
    return {
        label: inputLabel,
        input: inputElement,
    };
}

let buildStartScreen = () => {
    let startScreen = Screens.createScreen('start');
    // create a simple form for filling out connection info
    let title = document.createElement('h2');

    let savedData = GameData.loadSavedConnectionInformation();
    title.innerHTML = 'Enter Archipelago Connection Details';
    let ipInput = createTextInputWithLabel('Host address:', 'ip_input', 2);
    ipInput.input.value = savedData.hostname;
    let portInput = createTextInputWithLabel('Port:', 'port_input', 3);
    portInput.input.value = savedData.port;
    let slotInput = createTextInputWithLabel('Slot Name:', 'slot_input', 4);
    slotInput.input.value = savedData.slot;
    let passwordInput = createTextInputWithLabel('Password:', 'password_input', 5);
    let connectButton = document.createElement('input');
    connectButton.type = 'button';
    connectButton.value = 'Connect';



    let centeredContainer = document.createElement('div');
    centeredContainer.classList.add('center');
    centeredContainer.id = 'start_grid';

    centeredContainer.appendChild(title);
    centeredContainer.appendChild(ipInput.input);
    centeredContainer.appendChild(ipInput.label);
    centeredContainer.appendChild(portInput.input);
    centeredContainer.appendChild(portInput.label);
    centeredContainer.appendChild(slotInput.input);
    centeredContainer.appendChild(slotInput.label);
    centeredContainer.appendChild(passwordInput.input);
    centeredContainer.appendChild(passwordInput.label);

    centeredContainer.appendChild(connectButton);

    startScreen.div.appendChild(centeredContainer);
    connectButton.onclick = () => {
        disableStartScreen();
        GameData.connectToServer(
            ipInput.input.value, 
            portInput.input.value,
            slotInput.input.value,
            'Ocarina of Time',
            passwordInput.input.value,
            )
            .then(()=> {
                Screens.show('gameView');
            })
            .catch(e => {
                Popups.createPopup(POPUP_TYPE.ERROR, e);
                enableStartScreen();
            });
    }
}


let disableStartScreen = () => {
    let elements = document.querySelectorAll('#start_grid>input');
    for(let element of elements.values()){
        // @ts-ignore
        element.disabled = true;
    }
}

let enableStartScreen = () => {
    let elements = document.querySelectorAll('#start_grid>input');
    for(let element of elements.values()){
        // @ts-ignore
        element.disabled = false;
    }
}



buildStartScreen();
Screens.show('start');