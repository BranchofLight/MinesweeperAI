/*
 * view.js
 */

var generateBoards = function(rs, cs) {
  var rows = rs;
  var cols = cs;
  var boards = document.getElementsByClassName('board');

  for (var b = 0; b < boards.length; b++) {
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = document.createElement("div");
        cell.className = "cell unclicked";
        if (c === 0 && r === 0) { cell.className += " top-left-cell"; }
        else if (c === cols-1 && r === 0) { cell.className += " top-right-cell"; }
        else if (r === 0) { cell.className += " top-row-cell"; }
        else if (c === 0 && r > 0 && r < rows-1) { cell.className += " inner-cell-left"; }
        else if (r > 0 && r < rows-1) { cell.className += " inner-cell"; }
        else if (c === 0 && r === rows-1) { cell.className += " btm-left-cell"; }
        else if (c > 0 && c < cols-1 && r === rows-1) { cell.className += " btm-row-cell"; }
        else if (c === cols-1 && r === rows-1) { cell.className += " btm-right-cell"; }

        cell.setAttribute("row", r);
        cell.setAttribute("column", c);
        boards[b].appendChild(cell);
      }
    }
  }
};

var revealAdjacentCells = function(r, c, board, game) {
  var adjacentCells = getAdjacentCells(r, c, game);
  for (var i = 0; i < adjacentCells.length; i++) {
    r = adjacentCells[i].row;
    c = adjacentCells[i].col;
    var elementToCheck = board.querySelectorAll("[row='"+r+"']")[c];

    if (elementToCheck.classList.contains("unclicked") && adjacentCells[i].value != MINE) {
      elementToCheck.classList.remove("unclicked");
      elementToCheck.className += " clicked";

      // Now go check it's cells and make them revealed if it's blank
      if (adjacentCells[i].value === BLANK) {
        revealAdjacentCells(adjacentCells[i].row, adjacentCells[i].col, board, game);
      }
    }
  }
};

var displayGame = function(game, board) {
  for (var r = 0; r < settings.rows; r++) {
    var row = board.querySelectorAll("[row='"+r+"']");
    for (var c = 0; c < settings.columns; c++) {
      row[c].innerText = game[r][c];
      if (game[r][c] != MINE && game[r][c] != BLANK) {
        row[c].className += (" mine-number-" + game[r][c]);
      }
    }
  }
};

var attachListeners = function(ai) {
  [].slice.call(ai.board.getElementsByClassName("unclicked")).forEach(function(e) {
    e.addEventListener("click", function(event) {
      event.target.classList.remove("unclicked");
      if (!event.target.classList.contains("clicked")) {
        event.target.className += " clicked";
      }

      if (event.target.innerText === MINE) {
        // LOSE
        console.log("Lose");
        document.getElementById(ai.lossSpan).innerText = parseInt(document.getElementById(ai.lossSpan).innerText)+1;
        var loss = document.getElementById(ai.lossSpan).innerText;
        var win = document.getElementById(ai.winSpan).innerText;
        loss = parseInt(loss); win = parseInt(win);

        document.getElementById(ai.percSpan).innerText = win / (loss+win);
        ai.games += 1;
        ai.losses += 1;
        newGame(ai);
      } else {
        revealAdjacentCells(parseInt(event.target.getAttribute("row")), parseInt(event.target.getAttribute("column")), event.target.parentElement, ai.hiddenBoard);
      }

      if (settings.mines === ai.board.getElementsByClassName("unclicked").length) {
        // WIN
        console.log("Win");
        document.getElementById(ai.lossSpan).innerText = parseInt(document.getElementById(ai.lossSpan).innerText)+1;
        var loss = document.getElementById(ai.lossSpan).innerText;
        var win = document.getElementById(ai.winSpan).innerText;
        loss = parseInt(loss); win = parseInt(win);

        document.getElementById(ai.percSpan).innerText = win / (loss+win);
        ai.games += 1;
        ai.wins += 1;
        newGame(ai);
      }
    }, false);
  });
};

var newGame = function(ai) {
  [].slice.call(ai.board.children).forEach(function(e2) {
    e2.classList.remove("clicked");
    e2.classList.add("unclicked");

    if (e2.className.indexOf("mine-number") > -1) {
      for (var num = 1; num <= 9; num++) {
        e2.classList.remove("mine-number-"+num);
      }
    }

    e2.innerText = BLANK;
  });

  if (ai.games >= settings.gamesQueue.length) {
    generateGame(settings.rows, settings.columns, settings.mines);
    ai.hiddenBoard = settings.gamesQueue[settings.gamesQueue.length-1];
    displayGame(settings.gamesQueue[settings.gamesQueue.length-1], ai.board);
  } else {
    displayGame(settings.gamesQueue[ai.games], ai.board);
    ai.hiddenBoard = settings.gamesQueue[ai.games];
  }
};
