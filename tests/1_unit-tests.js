const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver;

const PUZZLE = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
const SOLUTION = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';

suite('Unit Tests', () => {

  suiteSetup(() => {
    solver = new Solver();
  });

  test('Logic handles a valid puzzle string of 81 characters', () => {
    assert.deepEqual(solver.validate(PUZZLE), { valid: true });
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
    const invalid = 'A' + PUZZLE.slice(1);
    assert.deepEqual(solver.validate(invalid), { error: 'Invalid characters in puzzle' });
  });

  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    assert.deepEqual(solver.validate(PUZZLE.slice(1)), { error: 'Expected puzzle to be 81 characters long' });
  });

  // Row A of PUZZLE is "1.5..2.84"
  test('Logic handles a valid row placement', () => {
    assert.isTrue(solver.checkRowPlacement(PUZZLE, 'A', 2, '3'));
  });

  test('Logic handles an invalid row placement', () => {
    assert.isFalse(solver.checkRowPlacement(PUZZLE, 'A', 2, '5'));
  });

  // Column 2 of PUZZLE contains . . 2 9 . . 7 . 6
  test('Logic handles a valid column placement', () => {
    assert.isTrue(solver.checkColPlacement(PUZZLE, 'A', 2, '3'));
  });

  test('Logic handles an invalid column placement', () => {
    assert.isFalse(solver.checkColPlacement(PUZZLE, 'A', 2, '9'));
  });

  // Top-left region of PUZZLE contains 1 . 5 / . . 6 / . 2 .
  test('Logic handles a valid region (3x3 grid) placement', () => {
    assert.isTrue(solver.checkRegionPlacement(PUZZLE, 'A', 2, '3'));
  });

  test('Logic handles an invalid region (3x3 grid) placement', () => {
    assert.isFalse(solver.checkRegionPlacement(PUZZLE, 'A', 2, '6'));
  });

  test('Valid puzzle strings pass the solver', () => {
    assert.isString(solver.solve(PUZZLE));
  });

  test('Invalid puzzle strings fail the solver', () => {
    // Two 1s in row A make this puzzle impossible
    const impossible = '11' + PUZZLE.slice(2);
    assert.isFalse(solver.solve(impossible));
    assert.isFalse(solver.solve('not a puzzle'));
  });

  test('Solver returns the expected solution for an incomplete puzzle', () => {
    assert.equal(solver.solve(PUZZLE), SOLUTION);
  });

});
