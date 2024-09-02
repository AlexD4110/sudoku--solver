// api.js

"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route("/api/check").post((req, res) => {
    const { puzzle, coordinate, value } = req.body;
    
    if (!puzzle || !coordinate || !value) {
      return res.json({ error: "Required field(s) missing" });
    }

    // Validate the value is a number between 1 and 9
    if (!/^[1-9]$/.test(value)) {
      return res.json({ error: "Invalid value" });
    }

    const row = coordinate[0];
    const column = coordinate[1];

    if (
      coordinate.length !== 2 ||
      !/[a-i]/i.test(row) ||
      !/[1-9]/.test(column)
    ) {
      return res.json({ error: "Invalid coordinate" });
    }
    if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }

    if (/[^0-9.]/g.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    }

    const rowIndex = solver.letterToNumber(row) - 1;
    const columnIndex = parseInt(column, 10) - 1;

    // Check if the value is already placed in the given coordinate
    if (puzzle[rowIndex * 9 + columnIndex] == value) {
      return res.json({ valid: true });
    }

    let validCol = solver.checkColPlacement(puzzle, row, column, value);
    let validReg = solver.checkRegionPlacement(puzzle, row, column, value);
    let validRow = solver.checkRowPlacement(puzzle, row, column, value);
    
    let conflicts = [];
    if (validCol && validReg && validRow) {
      return res.json({ valid: true });
    } else {
      if (!validRow) conflicts.push("row");
      if (!validCol) conflicts.push("column");
      if (!validReg) conflicts.push("region");
      return res.json({ valid: false, conflict: conflicts });
    }
  });

  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;

    if (!puzzle) {
      return res.json({ error: "Required field missing" });
    }

    if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }

    if (/[^0-9.]/g.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    }

    let solvedString = solver.solve(puzzle);
    if (!solvedString) {
      return res.json({ error: "Puzzle cannot be solved" });
    } else {
      return res.json({ solution: solvedString });
    }
  });
};
