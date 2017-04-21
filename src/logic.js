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
