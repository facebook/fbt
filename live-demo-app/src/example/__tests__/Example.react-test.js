/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow strict-local
 */

import Example from '../Example.react';
import * as React from 'react';
import renderer from 'react-test-renderer';

describe('Example.react', () => {
  it('renders the example', () => {
    const example = renderer.create(<Example />).toJSON();
    expect(example).toMatchSnapshot();
  });
});
