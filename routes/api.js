'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {

  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;

      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }

      const validation = solver.validate(puzzle);
      if (validation.error) return res.json(validation);

      if (!/^[A-Ia-i][1-9]$/.test(coordinate)) {
        return res.json({ error: 'Invalid coordinate' });
      }

      if (!/^[1-9]$/.test(value)) {
        return res.json({ error: 'Invalid value' });
      }

      const row = coordinate[0].toUpperCase();
      const column = Number(coordinate[1]);

      const conflict = [];
      if (!solver.checkRowPlacement(puzzle, row, column, value)) conflict.push('row');
      if (!solver.checkColPlacement(puzzle, row, column, value)) conflict.push('column');
      if (!solver.checkRegionPlacement(puzzle, row, column, value)) conflict.push('region');

      if (conflict.length) return res.json({ valid: false, conflict });
      res.json({ valid: true });
    });

  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;

      const validation = solver.validate(puzzle);
      if (validation.error) return res.json(validation);

      const solution = solver.solve(puzzle);
      if (!solution) return res.json({ error: 'Puzzle cannot be solved' });

      res.json({ solution });
    });
};
