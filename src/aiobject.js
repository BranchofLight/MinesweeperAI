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
