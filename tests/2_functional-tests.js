const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const PUZZLE = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
const SOLUTION = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';
const INVALID_CHARS = 'A' + PUZZLE.slice(1);
const WRONG_LENGTH = PUZZLE.slice(1);
const UNSOLVABLE = '11' + PUZZLE.slice(2);

function post(path, body) {
  return chai.request(server).keepOpen().post(path).send(body);
}

suite('Functional Tests', () => {

  suite('POST /api/solve', () => {
    test('Solve a puzzle with valid puzzle string: POST request to /api/solve', (done) => {
      post('/api/solve', { puzzle: PUZZLE }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { solution: SOLUTION });
        done();
      });
    });

    test('Solve a puzzle with missing puzzle string: POST request to /api/solve', (done) => {
      post('/api/solve', {}).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Required field missing' });
        done();
      });
    });

    test('Solve a puzzle with invalid characters: POST request to /api/solve', (done) => {
      post('/api/solve', { puzzle: INVALID_CHARS }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
        done();
      });
    });

    test('Solve a puzzle with incorrect length: POST request to /api/solve', (done) => {
      post('/api/solve', { puzzle: WRONG_LENGTH }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
        done();
      });
    });

    test('Solve a puzzle that cannot be solved: POST request to /api/solve', (done) => {
      post('/api/solve', { puzzle: UNSOLVABLE }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' });
        done();
      });
    });
  });

  suite('POST /api/check', () => {
    test('Check a puzzle placement with all fields: POST request to /api/check', (done) => {
      post('/api/check', { puzzle: PUZZLE, coordinate: 'A2', value: '3' }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { valid: true });
        done();
      });
    });

    test('Check a puzzle placement with single placement conflict: POST request to /api/check', (done) => {
      // 8 is already in row A, but not in column 2 or the top-left region
      post('/api/check', { puzzle: PUZZLE, coordinate: 'A2', value: '8' }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.isFalse(res.body.valid);
        assert.deepEqual(res.body.conflict, ['row']);
        done();
      });
    });

    test('Check a puzzle placement with multiple placement conflicts: POST request to /api/check', (done) => {
      // 1 is in row A and in the top-left region, but not in column 2
      post('/api/check', { puzzle: PUZZLE, coordinate: 'A2', value: '1' }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.isFalse(res.body.valid);
        assert.deepEqual(res.body.conflict, ['row', 'region']);
        done();
      });
    });

    test('Check a puzzle placement with all placement conflicts: POST request to /api/check', (done) => {
      // 2 is in row A, column 2 and the top-left region
      post('/api/check', { puzzle: PUZZLE, coordinate: 'A2', value: '2' }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.isFalse(res.body.valid);
        assert.deepEqual(res.body.conflict, ['row', 'column', 'region']);
        done();
      });
    });

    test('Check a puzzle placement with missing required fields: POST request to /api/check', (done) => {
      post('/api/check', { puzzle: PUZZLE, value: '3' }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Required field(s) missing' });
        done();
      });
    });

    test('Check a puzzle placement with invalid characters: POST request to /api/check', (done) => {
      post('/api/check', { puzzle: INVALID_CHARS, coordinate: 'A2', value: '3' }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
        done();
      });
    });

    test('Check a puzzle placement with incorrect length: POST request to /api/check', (done) => {
      post('/api/check', { puzzle: WRONG_LENGTH, coordinate: 'A2', value: '3' }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
        done();
      });
    });

    test('Check a puzzle placement with invalid placement coordinate: POST request to /api/check', (done) => {
      post('/api/check', { puzzle: PUZZLE, coordinate: 'K10', value: '3' }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid coordinate' });
        done();
      });
    });

    test('Check a puzzle placement with invalid placement value: POST request to /api/check', (done) => {
      post('/api/check', { puzzle: PUZZLE, coordinate: 'A2', value: '0' }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid value' });
        done();
      });
    });
  });

});
