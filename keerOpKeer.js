let dice = setupDice();
let diceValues = [];
let selectedDice = {};
let unavailableDice = null;

let isOnDiceTurn = false;

let canThrowDice = false;

let disableTiles = true;

let colorDye = null;
let numberDye = null;
let number = null;
let color = null;

let crossedMatrix = setupCrossedMatrix();
let crossedTiles = [];

let selectedTiles = [];
let selectedTilesDOM = [];

let starMatrix = setupStarMatrix();

let columnsDOM = setupColumns();
let colorsDOM = setupColors();

let pointsColorBonus = 0;
let pointsColumnBonus = 0;
let pointsJokerBonus = 8;
let pointsStarPenalty = 30;
let pointsTotal = -30;

let pointsDOM = setupPoints();

const columnRewards = [
    [5, 3, 3, 3, 2, 2, 2, 1, 2, 2, 2, 3, 3, 3, 5],
    [3, 2, 2, 2, 1, 1, 1, 0, 1, 1, 1, 2, 2, 2, 3]
];

const ws = new WebSocket("wss://178.223.211.48:8082");
ws.addEventListener("open", () => {
    console.log("The connection is open!");
})

ws.addEventListener("message", message => {
    console.log(message);
    let data = JSON.parse(message.data);

    switch (data.type) {
        case 0:
            startGame(data);
            break;
        case 2:
            receiveDice(data);
            break;
        case 3:
            receiveDice(data);
            break;
        case 4:
            receiveTurnResponse(data);
            break;
        case 5:
            startTurn(data);
            break;
        case 6:
            canThrowDice = true;
            resetDice();
            enableDice();
            break;
        case 7:
            resetDice();
            break;
        case 8:
            crossColumn(data);
            break;
        case 9:
            circleColumn(data);
            break;
        case 10:
            crossColor(data);
            break;
        case 11:
            circleColor(data);
            break;
        case 12:
            winOrLoss(data);
            break;
        case 13:
            handleDraw();
            break;
    }
});

function joinQueue() {
    let message = {type: 0};
    ws.send(JSON.stringify(message));
}

function startGame(data) {
    if (data.isOnTurn) {
        enableDice();
        canThrowDice = true;
    } else {
        disableDice();
        canThrowDice = false;
    }
}

function startTurn(data) {
    if (!data.hasOwnProperty("unavailableDice")) return;

    if (data.unavailableDice != null) {
        dice[data.unavailableDice.color].classList.add("unavailable-dye");
        dice[data.unavailableDice.number].classList.add("unavailable-dye");
    }

    unavailableDice = data.unavailableDice;

    disableTiles = false;
    enableDice();
}

function diceClick(dye) {
    if (canThrowDice) throwDice();
    else {
        selectDye(dye);
    }
}

function throwDice() {
    canThrowDice = false;
    let message = {type: 2};
    ws.send(JSON.stringify(message));
}

function receiveDice(data) {
    for (let i = 0; i < 3; i++) {
        dice[i].classList.remove(diceValues[i]);
        diceValues[i] = data.diceValues[i]
        dice[i].classList.add(diceValues[i]);
    }
    for (let i = 3; i < 6; i++) {
        diceValues[i] = data.diceValues[i]
        dice[i].innerHTML = diceValues[i];
    }

    disableTiles = false;
}

function selectDye(dye) {
    if (dye.classList.contains("number-dye")) {
        if (numberDye != null) {
            numberDye.classList.remove("selected-dye");
        }
        numberDye = dye;
        numberDye.classList.add("selected-dye");
        for (let i = 3; i < 6; i++) {
            if (dice[i] === numberDye) {
                number = diceValues[i];
                selectedDice.number = i;
            }
        }
    } else {
        if (colorDye != null) {
            colorDye.classList.remove("selected-dye");
        }
        colorDye = dye;
        colorDye.classList.add("selected-dye");
        for (let i = 0; i < 3; i++) {
            if (dice[i] === colorDye) {
                color = diceValues[i];
                selectedDice.color = i;
            }
        }
    }

    console.log(number);
    console.log(color);
    console.log('\n');
}

function receiveTurnResponse(data) {
    if (!data.hasOwnProperty("isValidTurn")) return;

    if (data.isValidTurn === true) {
        clearDyeSelection();
        crossTileSelection();
    } else {
        clearDyeSelection();
        clearTileSelection();

        enableDice();
        disableTiles = false;
    }
}

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

function setupStarMatrix() {
    return [
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
    ];
}

function setupDice() {
    let dice = [];
    for (let i = 0; i < 6; i++) {
        dice.push(document.getElementById("dye" + i));
    }
    return dice;
}

function setupColumns() {
    let columns = [[], []];

    for (let i = 0; i < 15; i++) {
        columns[0].push(document.getElementById("maxCol" + i));
    }

    for (let i = 0; i < 15; i++) {
        columns[1].push(document.getElementById("col" + i));
    }

    return columns;
}

function setupColors() {
    let colorsDOM = {};
    colorsDOM["colorMax-green"] = document.getElementById("colorMax-green");
    colorsDOM["colorMax-yellow"] = document.getElementById("colorMax-yellow");
    colorsDOM["colorMax-blue"] = document.getElementById("colorMax-blue");
    colorsDOM["colorMax-red"] = document.getElementById("colorMax-red");
    colorsDOM["colorMax-orange"] = document.getElementById("colorMax-orange");
    colorsDOM["color-green"] = document.getElementById("color-green");
    colorsDOM["color-yellow"] = document.getElementById("color-yellow");
    colorsDOM["color-blue"] = document.getElementById("color-blue");
    colorsDOM["color-red"] = document.getElementById("color-red");
    colorsDOM["color-orange"] = document.getElementById("color-orange");

    return colorsDOM;
}

function setupPoints() {
    let pointsDOM = {}
    pointsDOM.colorBonus = document.getElementById("colorBonus");
    pointsDOM.columnBonus = document.getElementById("columnBonus");
    pointsDOM.jokerBonus = document.getElementById("jokerBonus");
    pointsDOM.starPenalty = document.getElementById("starPenalty");
    pointsDOM.pointTotal = document.getElementById("pointsTotal");
    return pointsDOM;
}

function selectTile(tile) {
    if (disableTiles) return;

    let coords = {"x": parseInt(tile.dataset.x), "y": parseInt(tile.dataset.y)};

    if (selectedTiles.includes(coords) || selectedTiles.length >= number || !tile.classList.contains("tile-" + color) || tile.classList.contains("tile-crossed")) return;

    if (selectedTiles.length === 0) {
        if (coords.x === 7) {
            selectedTiles.push(coords);
            selectedTilesDOM.push(tile);
            tile.classList.add("tile-selected");
            tile.setAttribute("onclick", "deselectTile(this)");
            return;
        }

        for (let crossedTile of crossedTiles) {
            if (isAdjacent(coords, crossedTile)) {
                selectedTiles.push(coords);
                selectedTilesDOM.push(tile);
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
            selectedTilesDOM.push(tile);
            tile.classList.add("tile-selected");
            tile.setAttribute("onclick", "deselectTile(this)");
            return;
        }
    }
}

function deselectTile(tile) {
    if (disableTiles) return;

    let index = selectedTilesDOM.indexOf(tile);
    if (index === -1) return;

    tile.classList.remove("tile-selected");
    tile.setAttribute("onclick", "selectTile(this)");

    selectedTilesDOM.splice(index, 1);
    selectedTiles.splice(index, 1);
}

function lockTiles() {
    if (selectedTiles.length !== number) return;
    let message = {"type": "command", "command": "lockTiles", "selectedTiles": selectedTiles};
    ws.send(JSON.stringify(message));
}

function endTurn() {
    if (selectedTiles.length !== number && selectedTiles.length !== 0) return;

    disableTiles = true;
    disableDice();

    let message = {type: 3, selectedDice: selectedDice, selectedTiles: selectedTiles};
    ws.send(JSON.stringify(message));
}

function isAdjacent(tile1, tile2) {
    if (tile1.x == tile2.x && (tile1.y == tile2.y - 1 || tile1.y == tile2.y + 1)) return true;
    if (tile1.y == tile2.y && (tile1.x == tile2.x - 1 || tile1.x == tile2.x + 1)) return true;
    return false;
}

function clearDyeSelection() {
    dice[selectedDice.color].classList.remove("selected-dye");
    dice[selectedDice.number].classList.remove("selected-dye");

    selectedDice = {};
    colorDye = null;
    color = null;
    numberDye = null;
    number = null;
}

function clearTileSelection() {
    for (let tile of selectedTilesDOM) {
        tile.classList.remove("tile-selected");
    }

    selectedTiles = [];
    selectedTilesDOM = [];
}

function crossTileSelection() {
    for (let tile of selectedTilesDOM) {
        tile.classList.remove("tile-selected");
        tile.classList.add("tile-crossed");
    }

    let cnt = 0;
    for (let tile of selectedTiles) {
        if (starMatrix[tile.y][tile.x]) cnt++;
    }
    updateStarPenalty(cnt);

    crossedTiles.push(...selectedTiles);
    selectedTiles = [];
    selectedTilesDOM = [];
}

function disableDice() {
    for (let dye of dice) dye.classList.add("disabled-dye");
}

function enableDice() {
    for (let dye of dice) dye.classList.remove("disabled-dye");
}

function resetDice() {
    for (let i = 0; i < 3; i++) {
        dice[i].classList.remove(diceValues[i]);
    }
    for (let i = 3; i < 6; i++) {
        dice[i].innerHTML = "";
    }

    if (unavailableDice != null) {
        dice[unavailableDice.color].classList.remove("unavailable-dye");
        dice[unavailableDice.number].classList.remove("unavailable-dye");
        unavailableDice = null;
    }

    selectedDice = {};
    colorDye = null;
    color = null;
    numberDye = null;
    number = null;
}

function crossColumn(data) {
    if (!data.hasOwnProperty("column") || !data.hasOwnProperty("maxPoints")) return;

    if (data.maxPoints) {
        columnsDOM[0][data.column].classList.add("tile-crossed");
    } else {
        columnsDOM[1][data.column].classList.add("tile-crossed");
    }

    updateColumnBonus(data.column, data.maxPoints);
}

function circleColumn(data) {
    if (!data.hasOwnProperty("column")) return;

    columnsDOM[0][data.column].classList.add("tile-circled");
}

function crossColor(data) {
    if (!data.hasOwnProperty("color") || !data.hasOwnProperty("maxPoints")) return;

    if (data.maxPoints) {
        colorsDOM["colorMax-" + data.color].classList.add("tile-crossed");
    } else {
        colorsDOM["color-" + data.color].classList.add("tile-crossed");
    }

    updateColorBonus(data.maxPoints);
}

function circleColor(data) {
    if (!data.hasOwnProperty("color")) return;

    colorsDOM["colorMax-" + data.color].classList.add("tile-circled");
}

function updateTotalPoints() {
    pointsTotal = pointsColorBonus + pointsColumnBonus + pointsJokerBonus - pointsStarPenalty;
    pointsDOM.pointTotal.innerHTML = "T = " + pointsTotal;
}

function updateColorBonus(maxPoints) {
    if (maxPoints) pointsColorBonus = pointsColorBonus + 5;
    else pointsColorBonus = pointsColorBonus + 3;
    pointsDOM.colorBonus.innerHTML = "B = " + pointsColorBonus;
    updateTotalPoints();
}

function updateColumnBonus(column, maxPoints) {
    if (maxPoints) pointsColumnBonus = pointsColumnBonus + columnRewards[0][column];
    else pointsColumnBonus = pointsColumnBonus + columnRewards[1][column];
    pointsDOM.columnBonus.innerHTML = "A-0 + " + pointsColumnBonus;
    updateTotalPoints();
}

function updateJokerBonus(points) {
    pointsJokerBonus = pointsJokerBonus - points;
    pointsDOM.jokerBonus.innerHTML = "!(+1) + " + pointsJokerBonus;
    updateTotalPoints();
}

function updateStarPenalty(stars) {
    pointsStarPenalty = pointsStarPenalty - stars * 2;
    pointsDOM.starPenalty.innerHTML = "S(-2) - " + pointsStarPenalty;
    updateTotalPoints();
}

function winOrLoss(data) {
    if (!data.hasOwnProperty("won")) return;
    if (data.won) {
        alert("CONGRATULATIONS! :) You won!");
    } else {
        alert("Condolences :( You lost...")
    }
}

function handleDraw() {
    alert("Congratulations! You are all winners!");
}
