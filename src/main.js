// @ts-check
import { Screens } from "./screen.js";
import { Popups, POPUP_TYPE} from "./popup.js";
import { Client, ITEMS_HANDLING_FLAGS, SERVER_PACKET_TYPE, CREATE_AS_HINT_MODE } from "archipelago.js";
import { Checklist } from "./checklist.js";

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

    let savedData = loadSavedConnectionInformation();
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
        connectToServer(
            ipInput.input.value, 
            portInput.input.value,
            slotInput.input.value,
            'Ocarina of Time',
            passwordInput.input.value,
            );
    }
}

/**
 * 
 * @param {string} host 
 * @param {string} port 
 * @param {string} slot 
 * @param {string} game 
 * @param {string} password 
 */
let connectToServer = (host, port, slot, game, password) => {
// verify
    if(host === ''){
        Popups.createPopup(POPUP_TYPE.ERROR, 'Please specify a host address');
        return;
    }
    if(port === '' || isNaN(parseInt(port))){
        Popups.createPopup(POPUP_TYPE.ERROR, 'Invalid port number');
        return;
    }
    if(slot === ''){
        Popups.createPopup(POPUP_TYPE.ERROR, 'Please specify a slot name');
        return;
    }
    if(game === ''){
        Popups.createPopup(POPUP_TYPE.ERROR, 'Please specify a game');
        return;
    }

    Popups.createPopup(POPUP_TYPE.INFO, 'Attempting to connect...');
    disableStartScreen();
    /** @type {import("archipelago.js").ConnectionInformation} */
    let connectionInfo = {
        hostname: host,
        port: Number.parseInt(port),
        name: slot,
        game: game,
        items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
        password: password,
    }

    let client = new Client();
    // Connect to the Archipelago server
    Checklist.setClientListeners(client);
    client
        .connect(connectionInfo)
        .then((packet) => {
            console.log("Connected to the server");
            Popups.createPopup(POPUP_TYPE.SUCCESS, `Succesfully connected as Player ${packet.slot}`);
            saveConnectionInformation(connectionInfo);
            Checklist.reciveClient(client);
        })
        .catch((error) => {
            console.error("Failed to connect:", error);
            if(typeof error[0] === 'string'){
                let e = error[0];
                if(e == 'InvalidSlot'){
                    Popups.createPopup(POPUP_TYPE.ERROR, `Failed to connect to slot, the slot name was invalid.`)
                }else if(e == 'InvalidGame'){
                    Popups.createPopup(POPUP_TYPE.ERROR, `Failed to connect to slot, the game name was invalid.`)
                }else {
                    Popups.createPopup(POPUP_TYPE.ERROR, `Failed to connect to slot, reason given by server: ${e}`)
                }
            }else{
                Popups.createPopup(POPUP_TYPE.ERROR, `Failed to connect to server, please verify connection details are correct and the server is running. ${host=='archipelago.gg' ? 'You can restart the server on archipelago.gg by reloading the room page.': 'Check with the server host for server status.'}`)
            }
            enableStartScreen();
            
        });
        window.addEventListener("beforeunload", () => {
            client.disconnect();
        });
}

/**
 * 
 * @param {import("archipelago.js").ConnectionInformation} connectionInfo 
 */
let saveConnectionInformation = (connectionInfo) => {
    let savedInformation = {
        hostname: connectionInfo.hostname,
        port: connectionInfo.port,
        slot: connectionInfo.name,
    }
    localStorage.setItem('archipelagoTrackerLastConnection', JSON.stringify(savedInformation));
}

let loadSavedConnectionInformation = () => {
    let defaultConnection = {
        hostname: 'archipelago.gg',
        port: '',
        slot: '',
    }
    let savedData = localStorage.getItem('archipelagoTrackerLastConnection');
    return savedData ? JSON.parse(savedData) : defaultConnection;
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

// /** @type {import("archipelago.js").ConnectionInformation} */
// let connection = {
//     hostname: 'archipelago.gg',
//     port: 49352,
//     name: 'Dr.OOT-Test',
//     game: 'Ocarina of Time',
//     items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
// }

// let client = new Client();
// client.addListener(SERVER_PACKET_TYPE.CONNECTED, (packet) => {
//     console.log("Connected to server: ", packet);
// });

// client.addListener(SERVER_PACKET_TYPE.ROOM_UPDATE, (packet) => {
//     console.log("Room update: ", packet);
// });


// // Connect to the Archipelago server
// client
//     .connect(connection)
//     .then(() => {
//         console.log("Connected to the server");
//         client.addListener('LocationInfo', p => {
//             console.log(`LP: ${client.locations.name(player.game, p.locations[0].location) } has ${client.items.name(connection.game, p.locations[0].item)}`)
//         })
//         /** @type {import("archipelago.js").Player}*/
//         // @ts-ignore
//         let player = client.data.players.get(client.data.slot);
//         console.log(player);
//         let locationId = client.locations.id(player.game, 'Graveyard Shield Grave Chest')
//         // @ts-ignore

//         client.locations.scout(CREATE_AS_HINT_MODE.NO_HINT, locationId);
//         // client.locations.check(locationId)
//         // let name = client.locations.name(connection.game, client.locations.missing[0]);
//         // console.log(name);
//     })
//     .catch((error) => {
//         console.error("Failed to connect:", error);
//         // Handle the connection error.
//     });
// // @ts-ignore
// window.apClient = client;

// window.addEventListener("beforeunload", () => {
//     client.disconnect();
// });