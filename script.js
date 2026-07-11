const board = document.getElementById("board");

const solveBtn = document.getElementById("solve-btn");
const clearBtn = document.getElementById("clear-btn");
const resetBtn = document.getElementById("reset-btn");

const speedSlider = document.getElementById("speed");

const callsText = document.getElementById("calls");
const backtrackText = document.getElementById("backtracks");
const currentText = document.getElementById("current");
const timeText = document.getElementById("time");

let recursiveCalls = 0;
let backtracks = 0;
let delay = 300;
let solving = false;
let originalBoard = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getCell(row, col) {
    return document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );
}

function updateStats() {
    callsText.textContent = recursiveCalls;
    backtrackText.textContent = backtracks;
}

function clearHighlights() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.style.background = "white";
    });
}

function highlight(row, col) {
    clearHighlights();

    const cell = getCell(row, col);

    cell.style.background = "#ffe066";

    currentText.textContent = `${row + 1}, ${col + 1}`;
}

function setValue(row, col, value, color = "#2e7d32") {

    const cell = getCell(row, col);

    cell.value = value === 0 ? "" : value;

    if (value === 0)
        cell.style.color = "black";
    else
        cell.style.color = color;

}

function createBoard() {

    board.innerHTML = "";

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            const cell = document.createElement("input");

            cell.type = "text";
            cell.maxLength = 1;

            cell.classList.add("cell");

            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.inputMode = "numeric";

            cell.addEventListener("input", () => {

                if (!/^[1-9]?$/.test(cell.value)) {
                    cell.value = "";
                }

            });

            board.appendChild(cell);

        }

    }

}

function getBoard() {

    const grid = [];

    for (let r = 0; r < 9; r++) {

        grid.push([]);

        for (let c = 0; c < 9; c++) {

            const value = getCell(r, c).value;

            grid[r].push(value === "" ? 0 : Number(value));

        }

    }

    return grid;

}

function loadBoard(grid) {

    for (let r = 0; r < 9; r++) {

        for (let c = 0; c < 9; c++) {

            setValue(r, c, grid[r][c]);

        }

    }

}

function lockBoard(lock) {

    document.querySelectorAll(".cell").forEach(cell => {

        cell.disabled = lock;

    });

}

createBoard();



updateStats();

function isSafe(board, row, col, num) {

    for (let i = 0; i < 9; i++) {

        if (board[row][i] === num)
            return false;

        if (board[i][col] === num)
            return false;

    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = startRow; i < startRow + 3; i++) {

        for (let j = startCol; j < startCol + 3; j++) {

            if (board[i][j] === num)
                return false;

        }

    }

    return true;

}

function findEmpty(board) {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (board[row][col] === 0)
                return [row, col];

        }

    }

    return null;

}

function isValidBoard(board) {

    for (let row = 0; row < 9; row++) {

        let seen = new Set();

        for (let col = 0; col < 9; col++) {

            const num = board[row][col];

            if (num === 0)
                continue;

            if (seen.has(num))
                return false;

            seen.add(num);

        }

    }

    for (let col = 0; col < 9; col++) {

        let seen = new Set();

        for (let row = 0; row < 9; row++) {

            const num = board[row][col];

            if (num === 0)
                continue;

            if (seen.has(num))
                return false;

            seen.add(num);

        }

    }

    for (let boxRow = 0; boxRow < 9; boxRow += 3) {

        for (let boxCol = 0; boxCol < 9; boxCol += 3) {

            let seen = new Set();

            for (let i = 0; i < 3; i++) {

                for (let j = 0; j < 3; j++) {

                    const num = board[boxRow + i][boxCol + j];

                    if (num === 0)
                        continue;

                    if (seen.has(num))
                        return false;

                    seen.add(num);

                }

            }

        }

    }

    return true;

}

async function solveSudoku(board) {

    recursiveCalls++;

    updateStats();

    const empty = findEmpty(board);

    if (empty === null)
        return true;

    const [row, col] = empty;

    highlight(row, col);

    await sleep(delay);

    for (let num = 1; num <= 9; num++) {

        if (isSafe(board, row, col, num)) {

            board[row][col] = num;

            setValue(row, col, num, "#2e7d32");

            await sleep(delay);

            if (await solveSudoku(board))
                return true;

            board[row][col] = 0;

            setValue(row, col, 0);
            backtracks++;

            updateStats();

            await sleep(delay);

        }

    }

    return false;

}

speedSlider.addEventListener("input", () => {

    delay = Number(speedSlider.value);

});

solveBtn.addEventListener("click", async () => {

    if (solving)
        return;

    solving = true;

    recursiveCalls = 0;
    backtracks = 0;

    updateStats();

    originalBoard = getBoard().map(row => [...row]);

    document.querySelectorAll(".cell").forEach(cell => {

    if (cell.value !== "")
        cell.style.color = "black";

});

    const grid = getBoard();

    if (!isValidBoard(grid)) {

        alert("Invalid Sudoku puzzle.");

        solving = false;

        return;

    }

    lockBoard(true);

    const start = performance.now();

    const solved = await solveSudoku(grid);

    const end = performance.now();

    timeText.textContent =
        `${(end - start).toFixed(2)} ms`;

    if (!solved)
        alert("No solution exists.");

    clearHighlights();

    lockBoard(false);

    solving = false;

});

clearBtn.addEventListener("click", () => {

    if (solving)
        return;

    document.querySelectorAll(".cell").forEach(cell => {

        cell.value = "";
        cell.style.background = "white";
        cell.style.color = "black";

    });

    recursiveCalls = 0;
    backtracks = 0;

    updateStats();

    currentText.textContent = "-";
    timeText.textContent = "0 ms";

});

resetBtn.addEventListener("click", () => {

    if (solving)
        return;

    if (originalBoard.length === 0) {

        clearBtn.click();
        return;

    }

    loadBoard(originalBoard);

    for (let r = 0; r < 9; r++) {

        for (let c = 0; c < 9; c++) {

            if (originalBoard[r][c] !== 0)
                getCell(r, c).style.color = "black";

        }

    }

    clearHighlights();

    recursiveCalls = 0;
    backtracks = 0;

    updateStats();

    currentText.textContent = "-";
    timeText.textContent = "0 ms";

});

delay = Number(speedSlider.value);

createBoard();
originalBoard = getBoard().map(row => [...row]);
updateStats();

