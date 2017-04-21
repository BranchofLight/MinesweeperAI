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
