const maxAttempts = 6;
const numLetters = 5;
const resultsModal = new bootstrap.Modal(document.getElementById("results"));
const aboutModal = new bootstrap.Modal(document.getElementById("about"));
const resultsContainer = document.getElementById("resultsContainer");
const infoButton = document.getElementById("infoButton");
const statsButton = document.getElementById("statsButton");
const copyResultsButton = document.getElementById("copyResultsButton");
const secretWord = getTodaysWord();

let gameState = "progress";

let currentRow = 0;
let currentGuess = "";
let guessHistory = Array(maxAttempts).fill(null).map(() => Array(numLetters).fill(null));

const grid = document.getElementById("grid");

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

for (let i = 0; i < maxAttempts; i++) {
    const row = document.createElement("div");
    row.classList.add("game-grid");
    for (let j = 0; j < numLetters; j++) {
        const cell = document.createElement("div");
        cell.classList.add("game-cell");
        row.appendChild(cell);
    }
    grid.appendChild(row);
}

const legalLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "~", "-", "_", "+", "=", "[", "]", "{", "}", "|", ":", ";", "'", '"', "<", ">", ",", ".", "?", "/"];

const keyboardLayout = [
    [":", ";", "'", '"', "<", ">", ",", ".", "?", "/"],
    ["~", "-", "_", "+", "=", "[", "]", "{", "}", "|"],
    ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
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

function getTodaysWord(randomString = new Date().toDateString()) {
    let letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "~", "-", "_", "+", "=", "[", "]", "{", "}", "|", ":", ";", "'", '"', "<", ">", ",", ".", "?", "/"]
    let rSeed = hashCode(randomString);
    let rWord = Array(numLetters);
    if (rSeed < 0) {
        rSeed *= -1;
    }
    for (let i = 0; i < numLetters; i++) {
        let digit = Math.floor(seededRandom(rSeed, 66)());
        if (digit === 67) {
            digit -= 1;
        }
        rWord[i] = digit;
        rSeed *= 7547;
    }
    let word = "";
    for (let i = 0; i < numLetters; i++) {
        word += letters[rWord[i]];
    }
    return word;
}

function hashCode(string){
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
        var code = string.charCodeAt(i);
        hash = ((hash<<5)-hash)+code;
        hash = hash & hash; // Convert to 32bit integer
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

document.addEventListener("keypress", function onEvent(event) {
    let typedKey = event.key;
    if (legalLetters.includes(typedKey) || typedKey == "Enter") {
        handleKey(typedKey);
    }
});

document.addEventListener("keydown", function onEvent(event) {
    let typedKey = event.key;
    if (typedKey === "Backspace" || typedKey === "Delete") {
        handleKey("←")
    }
});

function handleKey(key) {

    if (currentRow >= maxAttempts) {
        return;
    }

    if (key === "←") {
        currentGuess = currentGuess.slice(0, -1);
    } else if (key === "Enter") {
        if (currentGuess.length === numLetters) {
            submitGuess();
        }
        return;
    // } else if (currentGuess.length < numLetters && /^[a-z]$/i.test(key)) {
    } else if (currentGuess.length < numLetters) {
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
    const row = grid.children[currentRow];

    const secret = secretWord.split("");
    const guessLetters = guess.split("");

    for (let i = 0; i < numLetters; i++) {
        const cell = row.children[i];
        let indexer = cell.innerHTML;
        if (indexer == "&amp;") {
            indexer = "&";
        } else if (indexer == "&lt;") {
            indexer = "<";
        } else if (indexer == "&gt;") {
            indexer = ">";
        }
        if (guessLetters[i] === secret[i]) {
            cell.classList.add("correct");
            guessHistory[currentRow][i] = "🟩";
            let keyboardKey = document.getElementById(`${indexer}Key`);
            keyboardKey.classList.add("green");
            secret[i] = null;
            guessLetters[i] = null;
        }
    }
    
    for (let i = 0; i < numLetters; i++) {
        const cell = row.children[i];
        let indexer = cell.innerHTML;
        if (indexer == "&amp;") {
            indexer = "&";
        } else if (indexer == "&lt;") {
            indexer = "<";
        } else if (indexer == "&gt;") {
            indexer = ">";
        }
        // console.log(cell.innerHTML);
        if (guessLetters[i]) {
            const index = secret.indexOf(guessLetters[i]);
            if (index !== -1) {
                cell.classList.add("present");
                guessHistory[currentRow][i] = "🟨";
                secret[index] = null;
                let keyboardKey = document.getElementById(`${indexer}Key`);
                keyboardKey.classList.add("yellow");
            } else {
                cell.classList.add("absent");
                guessHistory[currentRow][i] = "⬛";
                let keyboardKey = document.getElementById(`${indexer}Key`);
                keyboardKey.classList.add("gray");
            }
        }
    }

    if (guess === secretWord) {
        gameState = "win";
        showResults();
        return;
    }

    currentRow++;
    currentGuess = "";

    if (currentRow === maxAttempts) {
        gameState = "fail";
        showResults();
    }
}

function showResults() {
    resultsContainer.innerHTML = "";
    for (let i = 0; i < maxAttempts; i++) {
        resultsContainer.innerHTML += `<p style="margin:0; font-size:x-large">${guessHistory[i].join("")}</p>`;
    }
    if (gameState == "win") {
        resultsContainer.innerHTML += `<p style="margin:0; font-size:x-large">${currentRow + 1} / 6 Guesses</p>`;
    } else if (gameState == "fail") {
        resultsContainer.innerHTML += `<p style="margin:0; font-size:x-large">X / 6 Guesses</p>`;
        resultsContainer.innerHTML += `<p style="margin:0; font-size:x-large">The word was ${secretWord}.</p>`
    } else {
        resultsContainer.innerHTML += `<p style="margin:0; font-size:x-large">Keep trying to guess!</p>`;
    }
    resultsModal.show();
}

function copyResults() {
    if (gameState == "win" || gameState == "fail") {
        let textToCopy = "";
        textToCopy += `Hardle #${daysSinceStart()}\n`
        if (gameState == "win") {
            textToCopy += `${currentRow + 1} / 6 Guesses`;
        } else {
            textToCopy += "X / 6 Guesses";
        }
        for (let i = 0; i < maxAttempts; i++) {
            let guessLine = "\n" + guessHistory[i].join("");
            if (guessLine != "\n") {
                textToCopy += guessLine;
            }
        }
        copyToClipboard(textToCopy);
    } else {
        return;
    }
}

function daysSinceStart() {
    const today = new Date();
    const baseDate = new Date(2025, 6 - 1, 29 - 1);
    const timeDifference = today.getTime() - baseDate.getTime();
    const daysSince = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysSince;
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