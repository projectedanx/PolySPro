const assert = require('assert');

// Green: Passing test for Quiz State Machine
function testQuizState() {
  let state = { status: 'idle', currentCardIndex: 0, score: 0 };

  function handleAction(currentState, action) {
    if (action.type === 'START_QUIZ') {
        return { ...currentState, status: 'active' };
    }
    return currentState;
  }

  const action = { type: 'START_QUIZ' };
  const nextState = handleAction(state, action);

  try {
    assert.strictEqual(nextState.status, 'active', 'Expected state to be active after starting quiz');
    console.log('Test passed. Green Phase successful.');
  } catch (e) {
    console.error('Test failed.', e.message);
    process.exit(1);
  }
}

testQuizState();
