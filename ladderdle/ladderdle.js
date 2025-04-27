import { wordList } from "./ladderdleList.js";

const numLetters = 4;

const wordListLength = wordList.length - 1;

const resultsModal = new bootstrap.Modal(document.getElementById("results"));
const aboutModal = new bootstrap.Modal(document.getElementById("about"));
const resultsContainer = document.getElementById("resultsContainer");
const infoButton = document.getElementById("infoButton");
const statsButton = document.getElementById("statsButton");
const copyResultsButton = document.getElementById("copyResultsButton");

const startWord = getTodaysWord("start").toLowerCase();
const endWord = getTodaysWord("end").toLowerCase();

let gameState = "progress";

let currentRow = 0;
let currentGuess = "";
let guessHistory = [startWord];

const grid = document.getElementById("grid");
const gridStart = document.getElementById("grid-start");
const gridEnd = document.getElementById("grid-end");
const message = document.getElementById("message");

document.addEventListener('DOMContentLoaded', function () {
    statsButton.addEventListener("click", function() {
        showResults();
    });
    infoButton.addEventListener("click", function() {
        aboutModal.show();
    });
    copyResultsButton.addEventListener("click", function() {
        copyResults();
    });
});

for (let i = 0; i < 2; i++) {
    const row = document.createElement("div");
    row.classList.add("game-grid");
    for (let j = 0; j < numLetters; j++) {
        const cell = document.createElement("div");
        cell.classList.add("game-cell");
        cell.classList.add("given-cell");
        row.appendChild(cell);
        if (i == 0) {
            cell.textContent = startWord[j];
        } else {
            cell.textContent = endWord[j];
        }
    }
    if (i == 0) {
        gridStart.appendChild(row);
    } else {
        gridEnd.appendChild(row);
    }
}

function addEmptyRow() {
    const row = document.createElement("div");
    row.classList.add("game-grid");
    for (let j = 0; j < numLetters; j++) {
        const cell = document.createElement("div");
        cell.classList.add("game-cell");
        row.appendChild(cell);
    }
    grid.appendChild(row);
}

addEmptyRow();

const legalLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

const keyboardLayout = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["Enter", "z", "x", "c", "v", "b", "n", "m", "←"]
];

keyboardLayout.forEach((rowKeys, rowIndex) => {
    const row = document.getElementById(`row${rowIndex + 1}`);
    rowKeys.forEach(key => {
    const btn = document.createElement("button");
    btn.className = "btn btn-secondary";
    btn.id = `${key}Key`;
    btn.textContent = key;
    if (key === "Enter" || key === "←") btn.classList.add("wide");
        btn.onclick = () => handleKey(key);
        row.appendChild(btn);
    });
});

function getTodaysWord(position, randomString = new Date().toDateString()) {
    if (position == "start") {
        let rSeed = hashCode(randomString);
        rSeed = Math.abs(rSeed);
        let arrayVal = Math.floor(seededRandom(rSeed, 1000000)()) % wordList.length;
        return wordList[arrayVal];
    } else {
        let rSeed = hashCode(randomString);
        rSeed = Math.abs(rSeed);
        let arrayVal = Math.floor(seededRandom(rSeed * 1753, 1000000)()) % wordList.length;
        return wordList[arrayVal];;
    }
}

function hashCode(string) {
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
        var code = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash = hash & hash;
    }
    return hash;
}

function seededRandom(seed, max = 1) {
    let a = 1103515245;
    let c = 12345;
    let m = 2147483647;

    seed = (seed % m + c) % m;

    return function() {
        seed = (seed * a + c) % m;
        return seed / m * max;
    }
}

// Need to add all the randomization stuff!

document.addEventListener("keypress", function onEvent(event) {
    let typedKey = event.key;
    if (legalLetters.includes(typedKey) || typedKey == "Enter") {
        handleKey(typedKey);
    }
});

document.addEventListener("keydown", function onEvent(event) {
    let typedKey = event.key;
    if (typedKey == "Backspace" || typedKey == "Delete") {
        handleKey("←");
    }
});

function handleKey(key) {
    if (key == "←") {
        currentGuess = currentGuess.slice(0, -1);
    } else if (key == "Enter") {
        if (currentGuess.length == numLetters) {
            submitGuess();
        } else {
            showMessage("Not enough letters.");
        }
        return;
    } else if (currentGuess.length < numLetters && /^[a-z]$/i.test(key)) {
        currentGuess += key;
    }
    updateCurrentRow();
}

function updateCurrentRow() {
    const row = grid.children[currentRow];
    for (let i = 0; i < numLetters; i++) {
        const cell = row.children[i];
        cell.textContent = currentGuess[i] || "";
    }
}

function submitGuess() {
    const guess = currentGuess.toLowerCase();

    if (!checkGuess(guess, guessHistory[guessHistory.length - 1])) {
        showMessage("Only one letter can change.");
        return;
    }

    if (!checkWordList(guess)) {
        showMessage("Not in word list.");
        return;
    }

    guessHistory = guessHistory.concat(guess);

    if (guess == endWord) {
        gameState = "win";
        showResults();
        return;
    }

    addEmptyRow();
    currentRow++;
    currentGuess = "";

}

function checkWordList(guess) {
    return (wordList).includes(guess.toUpperCase());
}

function checkGuess(curr, prev) {
    let check0 = (curr[0] == prev[0]);
    let check1 = (curr[1] == prev[1]);
    let check2 = (curr[2] == prev[2]);
    let check3 = (curr[3] == prev[3]);
    let checkSum = check0 + check1 + check2 + check3;
    if (checkSum >= 3) {
        return true
    } else {
        return false
    }
}

function showResults() {
    resultsContainer.innerHTML = "";
    if (gameState == "win") {
        resultsContainer.innerHTML += `<p style="margin:0; font-size:x-large">You took ${guessHistory.length - 1} guess(es)</p>`;
    } else {
        resultsContainer.innerHTML += `<p style="margin:0; font-size:x-large">Keep trying to guess!</p>`;
    }
    resultsModal.show();
}

function copyResults() {
    if (gameState == "win") {
        let textToCopy = "";
        textToCopy += `Ladderdle #${daysSinceStart()}\n`;
        textToCopy += `${guessHistory.length - 1} Guess(es)`
        copyToClipboard(textToCopy);
    } else {
        return;
    }
}

function daysSinceStart() {
    const today = new Date();
    const baseDate = new Date(2025, 4 - 1, 25);
    const timeDifference = today.getTime() - baseDate.getTime();
    const daysSince = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysSince;
}

function showMessage(msg) {
    message.innerHTML = msg;
}

async function copyToClipboard(textToCopy) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
            
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
            
        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (error) {
            console.error(error);
        } finally {
            textArea.remove();
        }
    }
}