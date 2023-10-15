import { Checklist } from "./checklist.js";
import { Screens } from "./screen.js"
import { Invetory } from "./inventory.js";


let GameView = (() => {
    let screen = Screens.createScreen('gameView');

    screen.div.appendChild(Invetory.div);
    screen.div.appendChild(Checklist.container);

    return {

    }
})();

export {GameView}