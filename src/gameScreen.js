import { Checklist } from "./checklist.js";
import { Screens } from "./screen.js"
import { Inventory } from "./inventory.js";


let GameView = (() => {
    let screen = Screens.createScreen('gameView');
    let container = document.createElement('div');
    container.id = "gameViewContainer";

    screen.div.appendChild(container);
    container.appendChild(Inventory.div);
    container.appendChild(Checklist.container);
    let optionButton = document.createElement('input')
    optionButton.type = "button";
    optionButton.value = "Options";
    optionButton.id = "option_button";
    container.appendChild(optionButton);
    optionButton.addEventListener('click', () => {Screens.show("optionsView");});
    return {

    }
})();

export {GameView}