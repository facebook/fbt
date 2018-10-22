/**
 * Copyright 2015-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 * @emails oncall+internationalization
 */

const FbtReactUtil = require('FbtReactUtil');
const FbtResultBase = require('FbtResultBase');

const cx = require('cx');

function em(content, inlineMode, translation, hash) {
  // TODO: in the future, might depend on the translation status of the
  // string to decide on the proper inline mode.
  let className = cx('intlInlineMode/normal');
  if (hash) {
    if (inlineMode === 'TRANSLATION') {
      className = cx('intlInlineMode/translatable');
    } else if (inlineMode === 'APPROVE') {
      className = cx('intlInlineMode/approvable');
    } else if (inlineMode === 'REPORT') {
      className = cx('intlInlineMode/reportable');
    }
  }

  return {
    $$typeof: FbtReactUtil.REACT_ELEMENT_TYPE,
    type: 'em',
    key: null,
    ref: null,
    props: {
      // get the correct hash and trid when the data is available
      className,
      'data-intl-hash': hash,
      'data-intl-translation': translation,
      'data-intl-trid': '',
      children: content,
      // TODO (t22619936): This is because hack's fbt em tags don't match up to
      // the em tags produced here. Disabling hydration warnings prevents
      // spewing a hydration error anywhere server-side rendering is used with
      // fbt and then hydrated.
      suppressHydrationWarning: true,
    },
    _owner: null,
  };
}

const InlineFbtComponent = (props: Props) =>
  em(props.content, props.inlineMode, props.translation, props.hash);

type Props = {
  content: Array<any>,
  inlineMode: boolean,
  translation: string,
  hash: ?string,
};

class InlineFbtResult extends FbtResultBase {
  $$typeof: typeof FbtReactUtil.REACT_ELEMENT_TYPE;
  key: ?string = null;
  props: Props;
  ref: ?React$Ref<*> = null;
  type: (props: Props) => mixed;

  constructor(
    contents: Array<any>,
    inlineMode: boolean,
    translation: string,
    hash: ?string,
  ) {
    super(contents);
    /* eslint-disable fb-www/react-state-props-mutation */
    this.props = {
      content: contents,
      inlineMode,
      translation,
      hash,
    };
    if (__DEV__) {
      FbtReactUtil.defineProperty(this, '_store', {validated: true});
    }
  }
}
InlineFbtResult.prototype.type = InlineFbtComponent;
InlineFbtResult.prototype.$$typeof = FbtReactUtil.REACT_ELEMENT_TYPE;

module.exports = InlineFbtResult;
