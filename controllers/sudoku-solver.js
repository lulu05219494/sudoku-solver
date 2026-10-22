// Rows are given as letters A-I and columns as numbers 1-9 (same as the
// coordinate sent to /api/check). The puzzle is an 81-character string read
// row by row, with '.' for empty cells.
const ROWS = 'ABCDEFGHI';

function rowIndex(row) {
  return typeof row === 'number' ? row : ROWS.indexOf(String(row).toUpperCase());
}

function colIndex(column) {
  return Number(column) - 1;
}

class SudokuSolver {

  validate(puzzleString) {
    if (!puzzleString) return { error: 'Required field missing' };
    if (/[^1-9.]/.test(puzzleString)) return { error: 'Invalid characters in puzzle' };
    if (puzzleString.length !== 81) return { error: 'Expected puzzle to be 81 characters long' };
    return { valid: true };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const r = rowIndex(row);
    const c = colIndex(column);
    for (let col = 0; col < 9; col++) {
      if (col !== c && puzzleString[r * 9 + col] === String(value)) return false;
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const r = rowIndex(row);
    const c = colIndex(column);
    for (let rw = 0; rw < 9; rw++) {
      if (rw !== r && puzzleString[rw * 9 + c] === String(value)) return false;
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const r = rowIndex(row);
    const c = colIndex(column);
    const startRow = Math.floor(r / 3) * 3;
    const startCol = Math.floor(c / 3) * 3;
    for (let rw = startRow; rw < startRow + 3; rw++) {
      for (let col = startCol; col < startCol + 3; col++) {
        if ((rw !== r || col !== c) && puzzleString[rw * 9 + col] === String(value)) return false;
      }
    }
    return true;
  }

  isValidPlacement(puzzleString, row, column, value) {
    return this.checkRowPlacement(puzzleString, row, column, value) &&
      this.checkColPlacement(puzzleString, row, column, value) &&
      this.checkRegionPlacement(puzzleString, row, column, value);
  }

  // Returns the solved 81-character string, or false if it cannot be solved
  solve(puzzleString) {
    if (!this.validate(puzzleString).valid) return false;

    const grid = puzzleString.split('');

    // The given numbers must not already conflict with each other
    for (let i = 0; i < 81; i++) {
      if (grid[i] !== '.' && !this.isValidPlacement(puzzleString, Math.floor(i / 9), (i % 9) + 1, grid[i])) {
        return false;
      }
    }

    const backtrack = () => {
      const empty = grid.indexOf('.');
      if (empty === -1) return true;

      const r = Math.floor(empty / 9);
      const c = (empty % 9) + 1;
      const current = grid.join('');
      for (let n = 1; n <= 9; n++) {
        if (this.isValidPlacement(current, r, c, n)) {
          grid[empty] = String(n);
          if (backtrack()) return true;
          grid[empty] = '.';
        }
      }
      return false;
    };

    return backtrack() ? grid.join('') : false;
  }
}

module.exports = SudokuSolver;
