import assert from 'assert';
import sinon from 'sinon';

export function createObserver() {
  return {
    onNext: sinon.spy(),
    onError: sinon.spy(),
    onCompleted: sinon.spy()
  };
}

export function assertCalledWith(spy, expectedArgs, callIndex = 0) {
  assert.deepEqual(
    spy.getCall(callIndex).args,
    expectedArgs,
    'Observer first call was with wrong params!'
  );
}