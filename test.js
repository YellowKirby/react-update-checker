import { cloneDeep } from 'lodash';
import sinon from 'sinon';
import React from 'react';
import test from 'ava';
import enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import ReactUpdateChecker, {
  getComponent,
  getFailedKeys,
  isShallowEqual
} from '.';

enzyme.configure({ adapter: new Adapter() });

class Component extends ReactUpdateChecker {
  render() {
    return null;
  }
}

test.beforeEach(t => {
  t.context.sandbox = sinon.createSandbox();
});

test.afterEach(t => {
  t.context.sandbox.restore();
});

test('getFailedKeys: same object', t => {
  const obj = {
    foo: 'bar'
  };

  t.deepEqual(getFailedKeys(obj, obj), []);
});

test('getFailedKeys: object values are shallowly equal', t => {
  const o1 = {
    foo: 'bar',
    baz: 5
  };

  o1.recursive = o1;

  const o2 = {
    baz: 5,
    another: true,
    recursive: o1
  };

  t.deepEqual(getFailedKeys(o1, o2), []);
});

test('getFailedKeys: object values are deep equal but not shallowly equal', t => {
  const o1 = {
    foo: {
      nested: 'hi',
      again: {}
    },
    baz: 5
  };

  const o2 = {
    foo: {
      nested: 'hi',
      again: {}
    },
    another: true
  };

  t.deepEqual(getFailedKeys(o1, o2), ['foo']);
});

test('isShallowEqual exists', t => {
  t.true(isShallowEqual({ foo: 'bar' }, { foo: 'bar' }));
});

test('ReactUpdateChecker: stop update when props and state are shallowly equal', t => {
  const o1 = {};

  const props = {
    o1,
    p1: 'value',
    p2: true
  };

  const state = {
    o1,
    s1: 'state value',
    s2: 10
  };

  const element = shallow(React.createElement(Component, props));
  element.setState(state);

  t.false(element.instance().shouldComponentUpdate({ ...props }, { ...state }));
});

test('ReactUpdateChecker: allow update when props and state are not shallowly equal', t => {
  const o1 = {};

  const props = {
    o1,
    p1: 'value',
    p2: true
  };

  const state = {
    o1,
    s1: 'state value',
    s2: 10
  };

  const element = shallow(React.createElement(Component, props));
  element.setState(state);

  t.true(element.instance().shouldComponentUpdate({ new: 'prop' }, state));
  t.true(element.instance().shouldComponentUpdate(props, { new: 'state' }));
});

test.serial(
  'ReactUpdateChecker: console.warn when prop values are deeply equal but not shallowly equal',
  t => {
    t.context.sandbox.stub(console, 'warn');

    const o1 = {};

    const props = {
      o1,
      p1: 'value',
      p2: true
    };

    const state = {
      o1,
      s1: {},
      s2: 10
    };

    const element = shallow(React.createElement(Component, props));
    element.setState(state);

    const result = element
      .instance()
      .shouldComponentUpdate(cloneDeep(props), state);

    t.true(result);
    t.is(console.warn.firstCall.args[1], 'Component');
    t.is(console.warn.firstCall.args[2], 'props');
    t.is(console.warn.firstCall.args[4], 'o1');
    t.is(console.warn.firstCall.args[6], 'is');
  }
);

test.serial(
  'ReactUpdateChecker: console.warn when state values are deeply equal but not shallowly equal',
  t => {
    t.context.sandbox.stub(console, 'warn');

    const o1 = {};

    const props = {
      o1,
      p1: 'value',
      p2: true
    };

    const state = {
      o1,
      s1: {},
      s2: 10
    };

    const element = shallow(React.createElement(Component, props));
    element.setState(state);

    const result = element
      .instance()
      .shouldComponentUpdate(props, cloneDeep(state));

    t.true(result);

    t.is(console.warn.lastCall.args[2], 'state');
    t.is(console.warn.lastCall.args[4], 'o1`, `s1');
    t.is(console.warn.lastCall.args[6], 'are');
  }
);

test('getComponent: returns ReactUpdateChecker when arg is false', t => {
  t.is(getComponent(false), ReactUpdateChecker);
});

test('getComponent: returns React.PureComponent when arg is true', t => {
  t.is(getComponent(true), React.PureComponent);
});
