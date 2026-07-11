const board = document.getElementById("board");

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

            board.appendChild(cell);

        }

    }

}

createBoard();