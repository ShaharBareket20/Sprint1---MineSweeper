'use strict'

function colorNums(elCell, cell) {
    if (cell.minesAroundCount === 1) {
        elCell.style = 'color: blue';
    } else if (cell.minesAroundCount === 2) {
        elCell.style = 'color: red';
    } else if (cell.minesAroundCount === 3) {
        elCell.style = 'color: green';
    } else if (cell.minesAroundCount === 4) {
        elCell.style = 'color: yellow';
    } else(elCell.style = 'color: fuchsia');
}

function resetTime() {
    clearInterval(gGameInterval);
    gGameInterval = null;
    gGame.secsPassed = 0;
    var elTimer = document.querySelector('.timer');
    elTimer.innerHTML = `<span>${gGame.secsPassed}</span>`;
}

function createHints() {
    var strHTML = '';
    for (var i = 0; i < 3; i++) {
        strHTML += `<span class="hint" onclick="hintClicked(this)">${HINT}</span>`;
    }
    document.querySelector('.hints').innerHTML = strHTML;
}


function createLifes() {
    var strHTML = '';
    for (var i = 3; i >= 1; i--) {
        strHTML += `<span class="life life${i}">${LIFE}</span>`;
    }
    document.querySelector('.lifes').innerHTML = strHTML;
}

function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}