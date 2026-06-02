const assert = require('assert');

// Red: Failing test for Quiz State Machine
function testQuizState() {
  const initialState = { status: 'idle', currentCardIndex: 0, score: 0 };

  // Fake state transition
  const action = { type: 'START_QUIZ', payload: { questions: [{ symbol: 'A', options: ['A', 'B', 'C'], answer: 'A' }] } };

  // This function doesn't exist yet, so we'll just mock it to fail
  const nextState = { status: 'idle' }; // Intentionally wrong

  try {
    assert.strictEqual(nextState.status, 'active');
    console.log('Test passed.');
  } catch (e) {
    console.error('Red Phase: Test failed as expected.', e.message);
  }
}

testQuizState();
