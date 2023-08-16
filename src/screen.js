// @ts-check


let Screens = (() => {
    /**
     * @type {Map<string, any>}
     */
    let screens = new Map();
    /**
     * 
     * @param {string} name 
     * @returns 
     */
    let createScreen = (name) => {
        let div = document.createElement('div');
        div.classList.add('screen');
        document.body.appendChild(div);

        let hide = () => {
            div.classList.remove('screen_show');
        }

        let show = () => {
            div.classList.add('screen_show');
        }

        let screen = {
            get div() {return div},
            hide,
            show,
            get name()  {return name},
        };
        screens.set(name, screen);
        return screen;
    }

    /**
     * 
     * @param {string} name 
     */
    let show = (name) => {
        for(let screen of screens.values()){
            screen.hide();
        }
        screens.get(name)?.show();
    }
    return {
        createScreen,
        screens,
        show,
    }
})()

export {Screens};