import assert from 'assert';
import sinon from 'sinon';

export function createObserver() {
  return {
    next: sinon.spy(),
    error: sinon.spy(),
    complete: sinon.spy()
  };
}

export function assertCalledWith(spy, expectedArgs, callIndex = 0) {
  assert.deepEqual(
    spy.getCall(callIndex).args,
    expectedArgs,
    'Observer first call was with wrong params!'
  );
}