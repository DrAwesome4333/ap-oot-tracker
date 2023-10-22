import { Checklist } from "./checklist.js";
import { Screens } from "./screen.js"
import { Inventory } from "./inventory.js";


let GameView = (() => {
    let screen = Screens.createScreen('gameView');

    screen.div.appendChild(Inventory.div);
    screen.div.appendChild(Checklist.container);

    return {

    }
})();

export {GameView}