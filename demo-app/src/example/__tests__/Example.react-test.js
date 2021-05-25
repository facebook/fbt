/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 */

// TODO(T40113359) Re-enable once this test scenario is ready to be tested
// import Example from '../Example.react';
import * as React from 'react';
import renderer from 'react-test-renderer';

// TODO(T40113359) Re-enable once this test scenario is ready to be tested
xdescribe('Example.react', () => {
  it('renders the example', () => {
    const example = renderer.create(<Example />).toJSON();
    expect(example).toMatchSnapshot();
  });
});
