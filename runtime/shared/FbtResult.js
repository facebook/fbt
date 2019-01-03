/**
 * Copyright 2015-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --remote localhost:~/www
 *
 * @format
 * @flow strict-local
 * @emails oncall+internationalization
 */

import type {NestedFbtContentItems} from 'FbtResultBase';

const FbtReactUtil = require('FbtReactUtil');
const FbtResultBaseImpl = require('FbtResultBaseImpl');

const FbtComponent = (props: Props): mixed => props.content;

type Props = {
  content: NestedFbtContentItems,
};

class FbtResult extends FbtResultBaseImpl {
  $$typeof: Symbol | $TEMPORARY$number<0xeac7> =
    FbtReactUtil.REACT_ELEMENT_TYPE;
  key: ?string = null;
  props: Props;
  ref: ?React$Ref<React$ElementType> = null;
  type: (props: Props) => mixed = FbtComponent;

  constructor(contents: NestedFbtContentItems) {
    super(contents);
    /* eslint-disable fb-www/react-state-props-mutation */
    this.props = {
      content: contents,
    };

    if (__DEV__) {
      FbtReactUtil.defineProperty(this, '_store', {validated: true});
    }
  }
}

module.exports = FbtResult;
