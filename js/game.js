'use strict'

const MINE = '💣';
const FLAG = '🚩';
const LIFE = '❤️';
const HINT = '💡';
const SAFE_CLICK = '👍';
var gEmojis = ['😃', '😨', '😭', '😎'];
var gElEmoji = document.querySelector('.emoji');
var gGame;
var gBoard;
var gGameInterval = null;
var gLevels = [
    { idx: 0, SIZE: 4, MINES: 2 },
    { idx: 1, SIZE: 8, MINES: 12 },
    { idx: 2, SIZE: 12, MINES: 30 },
];

var gSelectedLevel = gLevels.slice();
var gBoomAudio = new Audio('audio/boom.mp3')
var gWinAudio = new Audio('audio/win.mp3')
var gFlagAudio = new Audio('audio/flag.wav')


function init(idx) {
    gElEmoji.innerHTML = gEmojis[0];
    gSelectedLevel = gLevels[idx]
    gBoard = buildBoard();
    renderBoard(gBoard);
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        isFirstClick: true,
        secsPassed: 0,
        lifesLeft: 3,
        hintsLeft: 3,
        safeClicksLeft: 3
    };
    createHints();
    createLifes();
    resetTime();
    var elMinesCounter = document.querySelector('.mines-left');
    elMinesCounter.innerHTML = `<span>${gSelectedLevel.MINES}</span>`;
    var dead = document.querySelector('.dead');
    dead.hidden = true;
    var victory = document.querySelector('.victory');
    victory.hidden = true;

}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gSelectedLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gSelectedLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHinted: false
            }

        }
    }
    return board;
}

function renderBoard(board) {
    var strHTML = '<table><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var className = `cell cell${i}-${j}`;
            strHTML += `<td class="${className}" 
            onclick="cellClicked(this, gBoard, ${i}, ${j})"
            oncontextmenu="markCell(this, gBoard, ${i}, ${j})">
            </td>`;
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    var elBoardContainer = document.querySelector('.board-container');
    elBoardContainer.innerHTML = strHTML;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var minesCount = minesCounter(board, i, j);
            board[i][j].minesAroundCount = minesCount;
        }
    }
}

function minesCounter(board, rowIdx, colIdx) {
    var minesCount = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === rowIdx && j === colIdx) continue;
            if (board[i][j].isMine) minesCount++;
        }
    }
    return minesCount++;
}

function spreadMines(board, posI, posJ) {
    var emptyCells = getEmptyCells(board, posI, posJ);
    for (var i = 0; i < gSelectedLevel.MINES; i++) {
        var rndIdx = getRandomIntInclusive(0, emptyCells.length - 1);
        var emptyCell = emptyCells[rndIdx];
        board[emptyCell.i][emptyCell.j].isMine = true;
        emptyCells.splice(rndIdx, 1);
    }
}

function getEmptyCells(board, safeCoordI, safeCoordJ) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (i === safeCoordI && j === safeCoordJ) continue;
            if (!board[i][j].isMine) emptyCells.push({ i: i, j: j });
        }
    }
    return emptyCells;
}

function renderCell(location, value) {
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
    elCell.classList.add('mine');
}


function cellClicked(elCell, board, i, j) {
    var cell = board[i][j];
    gGame.shownCount++;
    if (!gGame.isOn) return;
    if (cell.isShown) return;
    if (cell.isMarked) return;
    console.log('first click', gGame.isFirstClick)
    elCell.classList.add('revealed');
    elCell.innerText = board[i][j].minesAroundCount;
    if (board[i][j].minesAroundCount === 0) {
        elCell.innerText = '';
    }

    colorNums(elCell, cell);

    if (cell.isMine) {
        gGame.shownCount--;
        cell.isShown = true;
        var elMinesCounter = document.querySelector('.mines-left');
        elMinesCounter.innerHTML = --gSelectedLevel.MINES;
        if (gGame.lifesLeft > 1) {
            setTimeout(function() {
                gElEmoji.innerText = gEmojis[0];
            }, 1000)
        }
        gElEmoji.innerText = gEmojis[1];
        document.querySelector('.life' + (gGame.lifesLeft)).style.display = 'none';
        gGame.lifesLeft--;
        console.log(gGame.lifesLeft);
        if (gGame.lifesLeft === 0) {
            gameOver();
        }
        gBoomAudio.play();
        elCell.innerText = MINE;
        elCell.classList.remove('revealed');
        renderCell({ i: i, j: j }, MINE);
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[0].length; j++) {
                if (board[i][j].isMine && gGame.lifesLeft === 0) renderCell({ i: i, j: j }, MINE);
            }
        }
    }

    if (gGame.isFirstClick) {
        gGame.secsPassed = 0;
        gGameInterval = setInterval(function() {
            var elTimer = document.querySelector('.timer');
            elTimer.innerHTML = `<span>${gGame.secsPassed++}</span>`;
        }, 1000)
        gGame.isOn = true;
        gGame.isFirstClick = false;
        cell.isShown = true;
        spreadMines(board, i, j);
        setMinesNegsCount(board, i, j);
    }

    if (gGame.hintOn) {
        giveHint(board, i, j);
        console.log('hintGIVVEN')
        return;
    }
    console.log('markedCount', gGame.markedCount)
    console.log('shownCount', gGame.shownCount)
    console.log('MINES', gSelectedLevel.MINES)
    console.log(gSelectedLevel.SIZE);
    if (gGame.markedCount === gSelectedLevel.MINES ||
        gGame.shownCount === (gSelectedLevel.SIZE ** 2 - gSelectedLevel.MINES)) {
        winGame();

    }
}


function hintClicked(elHint) {
    if (!gGame.isOn) return;
    if (!gGame.hintsLeft) return;
    gGame.hintOn = true;
    elHint.style.display = 'none';
}

function giveHint(board, i, j) {
    for (var posI = i - 1; posI <= i + 1; posI++) {
        if (posI < 0 || posI >= board.length) continue;
        for (var posJ = j - 1; posJ <= j + 1; posJ++) {
            if (posJ < 0 || posJ >= board[0].length) continue;
            var cell = board[posI][posJ];
            if (cell.isMarked || cell.isShown) continue;
            cell.isHinted = true;
            if (cell.isMine) renderCell({ i: posI, j: posJ }, MINE);
            else renderCell({ i: posI, j: posJ }, cell.minesAroundCount);
            var elCell = document.querySelector(`.cell${posI}-${posJ}`);
            elCell.classList.add('show-hint');
        }
    }
    gGame.hintsLeft--;
    console.log('hint left', gGame.hintsLeft)
    setTimeout(function() { removeHint(board, i, j) }, 1000);
    gGame.hintOn = false;
}


function removeHint(board, i, j) {
    for (var posI = i - 1; posI <= i + 1; posI++) {
        if (posI < 0 || posI >= board.length) continue;
        for (var posJ = j - 1; posJ <= j + 1; posJ++) {
            if (posJ < 0 || posJ >= board[0].length) continue;
            var cell = board[posI][posJ];
            if (cell.isHinted) {
                cell.isHinted = false;
                renderCell({ i: posI, j: posJ }, '');
                var elCell = document.querySelector(`.cell${posI}-${posJ}`);
                elCell.classList.remove('show-hint');
                elCell.classList.remove('mine');
            }
        }
    }
}

function markCell(elCell, gBoard, i, j) {

    var currCell = gBoard[i][j];
    if (!currCell.isMarked && !currCell.isShown && !currCell.isMine) {
        gGame.markedCount++;
        currCell.isMarked = true;
        elCell.innerText = FLAG;
        var elMinesCounter = document.querySelector('.mines-left');
        elMinesCounter.innerHTML = `<span>${--gSelectedLevel.MINES}</span>`

    } else {
        gGame.markedCount--;
        currCell.isMarked = false;
        elCell.innerText = '';
        var elMinesCounter = document.querySelector('.mines-left');
        elMinesCounter.innerHTML = `<span>${gSelectedLevel.MINES++}</span>`
        renderCell({ i: i, j: j }, '');
        elCell.classList.remove('mine');
    }
}

function gameOver() {
    clearInterval(gGameInterval);
    gGame.isOn = false;
    var dead = document.querySelector('.dead');
    dead.hidden = false;
    gElEmoji.innerHTML = gEmojis[2];
    console.log('DEAD')
}

function winGame() {

    gGame.isWin = true;
    gGame.isOn = false;
    clearInterval(gGameInterval);
    gGameInterval = null;
    gElEmoji.innerHTML = gEmojis[3];
    gWinAudio.play();
    var victory = document.querySelector('.victory');
    victory.hidden = false;

}