let areDiceThrown = true;
let areDiceLocked = true;
let colorDye = null;
let numberDye = null;
let number = 4;
let color = "red";
let dice = setupDice();
let diceValues = [];
let crossedMatrix = setupCrossedMatrix();
let crossedTiles = [];

let selectedTiles = [];

const ws = new WebSocket("ws://localhost:8082");

function setupCrossedMatrix() {
    let crossedMatrix = [];
    for (let i = 0; i < 7; i++) {
        let row = [];
        for (let j = 0; j < 15; j++) {
            row.push(0);
        }
        crossedMatrix.push(row);
    }
    return crossedMatrix;
}

function setupDice() {
    let dice = [];
    for (let i = 0; i < 6; i++) {
        dice.push(document.getElementById("dye" + i));
    }
    return dice;
}

function throwDice() {
    areDiceThrown = true;
    let message = {"type": "command", "command": "throwDice"};
    ws.send(JSON.stringify(message));
}

function receiveDice(message) {
    for (let i = 0; i < 3; i++) {
        dice[i].classList.remove(diceValues[i]);
        dice[i].classList.add(message["diceValues"][i]);
    }
    for (let i = 3; i < 6; i++) {
        dice[i].text = message["diceValues"][i];
    }
}

function selectDye(dye) {
    if (dye.classList.contains("number-dye")) {
        if (numberDye != null) {
            numberDye.classList.remove("selected");
        }
        numberDye = dye;
        numberDye.classList.add("selected");
    } else {
        if (colorDye != null) {
            colorDye.classList.remove("selected");
        }
        colorDye = dye;
        colorDye.classList.add("selected");
    }
}

function lockDyeChoice() {

}

function selectTile(tile) {
    let coords = {"x": parseInt(tile.dataset.x), "y": parseInt(tile.dataset.y)};

    if (selectedTiles.includes(coords) || selectedTiles.length > number || !tile.classList.contains("tile-" + color)) return;

    if (selectedTiles.length == 0) {
        if (coords.x == 7) {
            selectedTiles.push(coords);
            tile.classList.add("tile-selected");
            tile.setAttribute("onclick", "deselectTile(this)");
            return;
        }

        console.log("Passed");

        for (let crossedTile of crossedTiles) {
            if (isAdjacent(coords, crossedTile)) {
                selectedTiles.push(coords);
                tile.classList.add("tile-selected");
                tile.setAttribute("onclick", "deselectTile(this)");
                return;
            }
        }

        return;
    }

    for (let selectedTile of selectedTiles) {
        if (isAdjacent(coords, selectedTile)) {
            selectedTiles.push(coords);
            tile.classList.add("tile-selected");
            tile.setAttribute("onclick", "deselectTile(this)");
            return;
        }
    }
}

function deselectTile(tile) {
    let coords = {"x": parseInt(tile.dataset.x), "y": parseInt(tile.dataset.y)};
    for (let i = 0; i < selectedTiles.length; i++) {
        if (selectedTiles[i].x == coords.x && selectedTiles[i].y == coords.y) {
            selectedTiles.splice(i, 1);
            tile.classList.remove("tile-selected");
            tile.setAttribute("onclick", "selectTile(this)");
            return;
        }
    }
}

function isAdjacent(tile1, tile2) {
    if (tile1.x == tile2.x && tile1.y == tile2.y - 1 || tile1.y == tile2.y + 1) return true;
    if (tile1.y == tile2.y && tile1.x == tile2.x - 1 || tile1.x == tile2.x + 1) return true;
    return false;
}