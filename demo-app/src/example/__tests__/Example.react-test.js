/**
 * Copyright (c) Facebook, Inc. and its affiliates. All rights reserved.
 *
 * @flow strict-local
 */

import * as React from 'react';
import renderer from 'react-test-renderer';

import Example from '../Example.react';

describe('Example.react', () => {
  it('renders the example', () => {
    const example = renderer.create(<Example />).toJSON();
    expect(example).toMatchSnapshot();
  });
});
