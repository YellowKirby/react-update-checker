import { keys, intersection, filter, isEqual, isEmpty } from 'lodash';
import isShallowEqual from 'fbjs/lib/shallowEqual';
import React from 'react';

export { isShallowEqual };

/**
 * Returns an array of property keys that fail shallow comparison even though
 * the values are deeply equal
 */
export function getFailedKeys(value, other) {
  return filter(
    intersection(keys(value), keys(other)),
    key => value[key] !== other[key] && isEqual(value[key], other[key])
  );
}

export class ReactUpdateChecker extends React.Component {
  _beNoisy(prefix, keys) {
    console.warn(
      '%s: %s `%c%s%c` failed shallow compare but %s deeply equal. The component will rerender 😭',
      this.constructor.name,
      prefix,
      'font-weight: bold',
      keys.join('`, `'),
      'font-weight: normal',
      keys.length === 1 ? 'is' : 'are'
    );
  }

  shouldComponentUpdate(newProps, newState) {
    const failedProps = getFailedKeys(this.props, newProps);
    const failedState = getFailedKeys(this.state, newState);

    if (!isEmpty(failedProps)) {
      this._beNoisy('props', failedProps);
      return true;
    }

    if (!isEmpty(failedState)) {
      this._beNoisy('state', failedState);
      return true;
    }

    return (
      !isShallowEqual(this.props, newProps) ||
      !isShallowEqual(this.state, newState)
    );
  }
}

export const getComponent = isProd =>
  isProd ? React.PureComponent : ReactUpdateChecker;

export default getComponent(process.env.NODE_ENV === 'production');
