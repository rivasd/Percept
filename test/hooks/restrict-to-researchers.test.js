const assert = require('assert');
const restrictToResearchers = require('../../src/hooks/restrict-to-researchers');

describe('\'restrictToResearchers\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = restrictToResearchers();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
