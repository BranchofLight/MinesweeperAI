var AI = function(b, hb, ws, ls, ps) {
  return {
    board: b,
    hiddenBoard: hb,
    games: 0,
    wins: 0,
    losses: 0,
    winSpan: ws,
    lossSpan: ls,
    percSpan: ps,
  };
};

var AIList = [];

/*
 * game.js
 */

var settings = {
  rows: 16,
  columns: 16,
  mines: 20,
  gamesQueue: [],
};

var Cell = function(r, c, val) {
  return {
    row: r,
    col: c,
    value: val,
    isClicked: false,
  };
};

var BLANK = "\u200C";
var MINE = "X";

var generateMineLocations = function(rows, columns, totalMines) {
  var map = {};
  var randRow = 0;
  var randCol = 0;
  var minesGenerated = 0;

  while (totalMines > minesGenerated) {
    randRow = Math.floor(Math.random() * (rows));
    randCol = Math.floor(Math.random() * (columns));

    if (!(map[randRow] && map[randRow].indexOf(randCol) > -1)) {
      if (map[randRow]) {
        map[randRow].push(randCol);
      } else {
        map[randRow] = [randCol];
      }
      minesGenerated += 1;
    }
  }

  return map;
};

var getAdjacentCells = function(r, c, game) {
  // All locations to check
  var adjacent = [
    [r-1, c-1],
    [r-1, c],
    [r-1, c+1],
    [r, c-1],
    [r, c+1],
    [r+1, c-1],
    [r+1, c],
    [r+1, c+1]
  ];

  var adjacentCells = [];

  for (var i = 0; i < adjacent.length; i++) {
    var row = adjacent[i][0];
    var col = adjacent[i][1];

    // If location is out of bounds do not check anything
    if (row >= 0 && row < settings.rows &&
        col >= 0 && col < settings.columns) {
      adjacentCells.push(Cell(row, col, game[row][col]));
    }
  }

  return adjacentCells;
};

var numOfAdjacentMines = function(r, c, game) {
  var numOfMines = 0;
  var adjacentCells = getAdjacentCells(r, c, game);

  for (var i = 0; i < adjacentCells.length; i++) {
    if (adjacentCells[i].value === MINE) {
      numOfMines += 1;
    }
  }

  return numOfMines;
};

var generateGame = function(rows, cols, mines) {
  var mineLocations = generateMineLocations(rows, cols, mines);

  // Create iterators early to be used multiple times
  var game = [];
  // Push new field onto field
  for (var r = 0; r < rows; r++) {
    // New array (row)
    game.push([]);
    for (var c = 0; c < cols; c++) {
      if (mineLocations[r] && mineLocations[r].includes(c)) {
        game[r].push(MINE);
      } else {
        game[r].push(BLANK);
      }
    }
  }

  // With mines and cells generated, time to calculate and add numbers
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      // If the value is not a mine
      if (game[r][c] != MINE) {
        // Calculate adjacent mines
        var newVal = numOfAdjacentMines(r, c, game);
        // Make sure it isn't zero which will be blank!
        if (newVal !== 0) {
          // Set new value
          game[r][c] = newVal;
        }
      }
    }
  }

  settings.gamesQueue.push(game);
};

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

/*
 * logic.js
 */

generateBoards(settings.rows, settings.columns);

generateGame(settings.rows, settings.columns, settings.mines);
var NBayes = AI(document.getElementById("top-left-board"), settings.gamesQueue[0], "win-tl", "loss-tl", "perc-tl");
AIList.push(NBayes);
var lowRisk = AI(document.getElementById("top-right-board"), settings.gamesQueue[0], "win-lr", "loss-lr", "perc-lr");
AIList.push(lowRisk);
var pathFind = AI(document.getElementById("btm-left-board"), settings.gamesQueue[0], "win-pf", "loss-pf", "perc-pf");
AIList.push(pathFind);
AIList.push(AI(document.getElementById("btm-right-board"), settings.gamesQueue[0]));

for (var i = 0; i < document.getElementsByClassName("board").length; i++) {
  displayGame(settings.gamesQueue[0], document.getElementsByClassName("board")[i]);
  attachListeners(AIList[i]);
}

var randClick = function(ai) {
  var randRow = 0;
  var randCol = 0;

  do {
    randRow = Math.floor(Math.random() * (settings.rows));
    randCol = Math.floor(Math.random() * (settings.columns));

    var elementToCheck = ai.board.querySelectorAll("[row='"+randRow+"']")[randCol];

    if (elementToCheck.classList.contains("unclicked")) {
      elementToCheck.click();
      return elementToCheck;
    }
  } while (false);
};

/*
 * Statistical Weight
 */

var statState = [];

 // Obtain a hash for the given node
var hashState = function(cells, ai) {
  var hash = "";
  // debugger;

  for (var i = 0; i < cells.length; i++) {
    var pos = i.toString();
    var val = (cells[i] === "") ? "0" : cells[i];

    hash += (pos+val);
  }

	return hash;
};

// Hash table representation of the node tree
var statHashTable = function() {
	var table = {};

	return {
		add: function(n, isSucc) {
			var hash = hashState(n, NBayes);
			if (table[hash]) {
        if (isSucc) {
          table[hash].success += 1;
        } else {
          table[hash].fail += 1;
        }
			} else {
        table[hash] = {};
        if (isSucc) {
				  table[hash].success = 1;
          table[hash].fail = 0;
        } else {
          table[hash].success = 0;
          table[hash].fail = 1;
        }
			}
		},
		get: function(n) {
			return table[n];
		},
		clear: function() {
			table = {};
		},
	};
}();

setInterval(function() {
  var prevLoss = NBayes.losses;
  var cellClicked = undefined;
  if (NBayes.board.getElementsByClassName("clicked").length > 0) {
    var cellsToCheck = NBayes.board.getElementsByClassName("unclicked");
    [].slice.call(cellsToCheck).forEach(function(e, i) {
      var adjCells = getAdjacentCells(parseInt(e.getAttribute("row")), parseInt(e.getAttribute("column")), NBayes.hiddenBoard);
      adjCells.forEach(function(e2, i2) { adjCells[i2] = e2.value; });
      adjCells.push(e.innerText);
      if (statHashTable.get(hashState(adjCells, NBayes)) != undefined) {
        var confidence =
          statHashTable.get(hashState(adjCells, NBayes)).success /
          (statHashTable.get(hashState(adjCells, NBayes)).success + statHashTable.get(hashState(adjCells, NBayes)).fail);
        if (confidence > 0.9) {
          e.click();
          cellClicked = e;
          console.log("Smart click!");
        }
      }
    })
  } else {
    cellClicked = randClick(NBayes);
    console.log("Random click!");
  }

  if (cellClicked === undefined) {
    cellClicked = randClick(NBayes);
  }

  if (cellClicked != undefined) {
    var adjCells = getAdjacentCells(parseInt(cellClicked.getAttribute("row")), parseInt(cellClicked.getAttribute("column")), NBayes.hiddenBoard);
    adjCells.forEach(function(e, i) { adjCells[i] = e.value; });
    adjCells.push(cellClicked.innerText); // Add initial clicked value
    statHashTable.add(adjCells, prevLoss === NBayes.losses);
  }
}, 500);

/*
 * Low Risk Bias
 */

setInterval(function() {
  if (lowRisk.board.getElementsByClassName("clicked").length > 0) {
    var sums = [];
    [].slice.call(lowRisk.board.getElementsByClassName("unclicked")).forEach(function(e, i) {
      var adjCells = getAdjacentCells(parseInt(e.getAttribute("row")), parseInt(e.getAttribute("column")), lowRisk.hiddenBoard);
      var s = adjCells.reduce(function(acc, val) {
        if (val.value === BLANK) {
          return acc += 0;
        } else if (val.value === MINE) {
          return acc += 10;
        } else {
          return acc += parseInt(val.value);
        }
      }, 0);
      sums.push(s);
    });
    var copySums = sums.slice();
    sums.sort(function(a, b) { return a-b; });

    lowRisk.board.getElementsByClassName("unclicked")[copySums.indexOf(sums[0])].click();
  } else {
    randClick(lowRisk);
  }
}, 1000);

/*
 * Pathfinding
 */
setInterval(function() {
  randClick(pathFind);
}, 500);
