// @ts-check
import { Checklist } from "./checklist.js";
import { Screens } from "./screen.js";

let OptionsView = (() => {
    let screen = Screens.createScreen("optionsView");
    let container = document.createElement('div');
    container.id = "options";
    screen.div.appendChild(container);
    let backButton = document.createElement("input");

    container.appendChild(backButton);
    backButton.value = "Exit";
    backButton.type = "button"
    let goBack = () => {
        Checklist.build();
        saveOptions();
        console.log(options);
        Screens.show("gameView");
    }
    backButton.addEventListener('click', goBack);
    let loadSavedOptions = () => {
        let defaultOptions = {
            "version":1,
            "separateGravesAndGrottos": true,
            "separateInteriors": true,
            "separateOverworld": true,
            "separateDungeons": true,
            "separateBosses": true,
        }
        let savedOptions = localStorage.getItem("archipelagoTrackerSavedOptions");
        return savedOptions ? JSON.parse(savedOptions) : defaultOptions;
    }

    let saveOptions = () => {
        localStorage.setItem('archipelagoTrackerSavedOptions', JSON.stringify(options));
    }

    let options = loadSavedOptions();

    let createOptionToggle = (optionName, optionText) => {
        let optionContainer = document.createElement('div');
        let optionSpan = document.createElement('span');
        optionSpan.innerText = optionText;
        let optionCheckbox = document.createElement('input');
        optionCheckbox.type = 'checkbox';
        optionCheckbox.checked = options[optionName];

        optionContainer.appendChild(optionSpan);
        optionContainer.appendChild(optionCheckbox);

        let updateOption = () => {
            options[optionName] = optionCheckbox.checked;
        }
        optionCheckbox.addEventListener("click", updateOption);
        return optionContainer;
    }

    let boxes = [
        createOptionToggle("separateGravesAndGrottos", "Separate Graves/Grottos"),
        createOptionToggle("separateInteriors", "Separate Interiors"),
        createOptionToggle("separateOverworld", "Separate Overworld Areas"),
        createOptionToggle("separateDungeons", "Separate Dungeons"),
        createOptionToggle("separateBosses", "Separate Dungeon Bosses"),
    ] 

    for(let box of boxes){
        container.appendChild(box)
    }


    return {
        get options(){return options},
    }
})();

export {OptionsView}