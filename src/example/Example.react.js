/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @fbt {"project": "fbt-live-demo-project"}
 * @noflow
 * @noformat Needed to preserve flow types in comments
 * @oncall i18n_fbt_js
 */

import './css/Example.css';
import classNames from 'classnames';
import fbt, {GenderConst, IntlVariations, init} from 'fbt';
import * as React from 'react';

const ExampleEnum = require('Example$FbtEnum');

const viewerContext = {
  GENDER: IntlVariations.GENDER_UNKNOWN,
  locale: 'en_US',
};

init({
  translations: require('../translatedFbts.json'),
  hooks: {
    getViewerContext: () => viewerContext,
  },
});

const LOCALES = Object.freeze({
  en_US: Object.freeze({
    bcp47: 'en-US',
    displayName: 'English (US)\u200e',
    englishName: 'English (US)',
    rtl: false,
  }),
  es_LA: Object.freeze({
    bcp47: 'es-419',
    displayName: 'Espa\u00F1ol',
    englishName: 'Spanish',
    rtl: false,
  }),
  ar_AR: Object.freeze({
    bcp47: 'ar',
    displayName: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629',
    englishName: 'Arabic',
    rtl: true,
  }),
  he_IL: Object.freeze({
    /* eslint-disable-next-line fb-www/gender-neutral-language */
    bcp47: 'he',
    displayName: '\u05E2\u05D1\u05E8\u05D9\u05EA',
    englishName: 'Hebrew',
    rtl: true,
  }),
  ja_JP: Object.freeze({
    bcp47: 'ja',
    displayName: '\u65E5\u672C\u8A9E',
    englishName: 'Japanese',
    rtl: false,
  }),
});

/*::
type Locale = $Keys<typeof LOCALES>;
type Variation = $Values<typeof IntlVariations>;
type SharedObj = $Keys<typeof ExampleEnum>;
type PronounGender = $Keys<typeof GenderConst>;

type Props = $ReadOnly<{||}>;

type State = {|
  locale: Locale,
  vcGender: Variation,
  ex1Name: string,
  ex1Gender: Variation,
  ex1Count: int,
  ex2Name: string,
  ex2Object: SharedObj,
  ex2Pronoun: PronounGender,
|};
*/

export default class Example extends React.Component/*:: <Props, State> */ {
  state = {
    locale: 'en_US',
    ex1Name: 'Someone',
    ex1Gender: IntlVariations.GENDER_UNKNOWN,
    ex1Count: 1,
    ex2Name: 'Someone',
    ex2Object: 'LINK',
    ex2Pronoun: GenderConst.UNKNOWN_SINGULAR,
  };

  setLocale(locale /*: Locale */) {
    viewerContext.locale = locale;
    this.setState({locale});
    const html = document.getElementsByTagName('html')[0];
    if (html != null) {
      html.lang = LOCALES[locale].bcp47;
    }
    document.body.className = LOCALES[locale].rtl ? 'rtl' : 'ltr';
  }

  onSubmit(event /*: SyntheticInputEvent<> */) {
    event.stopPropagation();
    event.preventDefault();
  }

  render() {
    const {locale} = this.state;

    return (
      <div>
        <div className="example">
          <div className="warning">
            {/* Wrap this title with fbt tags! */}
            Your FBT Demo
            {/* <fbt desc="title">Your FBT Demo</fbt> */}
          </div>
          <h1>
            {/* Wrap this header with fbt function! */}
            Construct sentences
            {/* {fbt('Construct sentences', 'header')} */}
          </h1>
          <h2>
            {/* Wrap this sentence with fbt tags! */}
            Use the form below to see FBT in action.
            {/* <fbt desc="yet another header">
              Use the form below to see FBT in action.
            </fbt> */}
          </h2>
          <form action="" method="get" onSubmit={this.onSubmit}>
            <fieldset>
              <span className="example_row">
                <span className="example_input--30">
                  <select
                    className="neatoSelect"
                    onChange={(event /*: SyntheticUIEvent<> */) => {
                      const vcGender = parseInt(event.target.value, 10);
                      viewerContext.GENDER = vcGender;
                      this.forceUpdate();
                    }}>
                    <option value={IntlVariations.GENDER_UNKNOWN}>
                      Your Gender:
                    </option>
                    <option value={IntlVariations.GENDER_MALE}>Female</option>
                    <option value={IntlVariations.GENDER_FEMALE}>Male</option>
                    <option value={IntlVariations.GENDER_UNKNOWN}>
                      Unknown
                    </option>
                  </select>
                </span>
              </span>
            </fieldset>

            <fieldset>
              <span className={classNames('example_row', 'example_row--multi')}>
                <span
                  className={classNames('example_input', 'example_input--40')}>
                  <input
                    name="name"
                    placeholder="name"
                    onChange={(event /*: SyntheticUIEvent<> */) => {
                      this.setState({ex1Name: event.target.value});
                    }}
                    type="text"
                  />
                </span>
                <span
                  className={classNames('example_input', 'example_input--30')}>
                  <input
                    name="count"
                    placeholder="count"
                    onChange={(event /*: SyntheticUIEvent<> */) => {
                      const val = parseInt(event.target.value, 10);
                      this.setState({ex1Count: isNaN(val) ? 1 : val});
                    }}
                    type="number"
                  />
                </span>
              </span>
            </fieldset>

            <fieldset>
              <span className="sentence example_row">
                {/* Use <fbt:plural> tags to express plurality */}
                {this.state.ex1Count === 1 ? (
                  <div>{this.state.ex1Name} has shared a photo with you.</div>
                ) : (
                  <div>
                    {this.state.ex1Name} has shared {this.state.ex1Count} photos
                    with you.
                  </div>
                )}
                {/* <fbt desc="example 1">
                  <fbt:param name="name" gender={this.state.ex1Gender}>
                    {this.state.ex1Name}
                  </fbt:param>
                  has shared
                  <fbt:plural
                    many="photos"
                    showCount="ifMany"
                    count={this.state.ex1Count}>
                    a photo
                  </fbt:plural>
                  with you.
                </fbt> */}
              </span>
            </fieldset>

            <fieldset>
              <span className={classNames('example_row', 'example_row--multi')}>
                <span
                  className={classNames('example_input', 'example_input--40')}>
                  <input
                    name="ex2Name"
                    placeholder="name"
                    onChange={(event /*: SyntheticUIEvent<> */) => {
                      this.setState({ex2Name: event.target.value});
                    }}
                    type="text"
                  />
                </span>
                <span
                  className={classNames('example_input', 'example_input--20')}>
                  <select
                    className="neatoSelect"
                    onChange={(event /*: SyntheticUIEvent<> */) => {
                      this.setState({ex2Object: event.target.value});
                    }}>
                    {Object.keys(ExampleEnum).map(k => (
                      <option key={k} value={k}>
                        {ExampleEnum[k]}
                      </option>
                    ))}
                  </select>
                </span>
                <span
                  className={classNames('example_row', 'example_input--20')}>
                  <select
                    className="neatoSelect"
                    onChange={(event /*: SyntheticUIEvent<> */) => {
                      this.setState({
                        ex2Pronoun: parseInt(event.target.value, 10),
                      });
                    }}>
                    <option value={GenderConst.UNKNOWN_PLURAL}>Gender:</option>
                    <option value={GenderConst.FEMALE_SINGULAR}>
                      Female (Singular)
                    </option>
                    <option value={GenderConst.MALE_SINGULAR}>
                      Male (Singular)
                    </option>
                    <option value={GenderConst.NOT_A_PERSON}>
                      Not a person
                    </option>
                    <option value={GenderConst.UNKNOWN_PLURAL}>
                      Unknown (Plural)
                    </option>
                    <option value={GenderConst.UNKNOWN_SINGULAR}>
                      Unknown (Singular)
                    </option>
                  </select>
                </span>
              </span>
            </fieldset>
            <fieldset>
              <span className="sentence example_row">
                {/* Use <fbt:enum> and <fbt:pronoun> for a complex sentence */}
                {this.state.ex2Name} has a {ExampleEnum[this.state.ex2Object]}{' '}
                to share!
                {/* <fbt desc="Example enum & pronoun">
                  <fbt:param name="name">
                    {this.state.ex2Name}
                  </fbt:param>
                  has a
                  <fbt:enum
                    enum-range={ExampleEnum}
                    value={this.state.ex2Object}
                  />
                  to share!
                </fbt> */}
                {/* <fbt desc="Example enum & pronoun">
                  <fbt:param name="name">{this.state.ex2Name}</fbt:param>
                  has a
                  <fbt:enum
                    enum-range={ExampleEnum}
                    value={this.state.ex2Object}
                  />
                  to share! View
                  <fbt:pronoun
                    type="possessive"
                    gender={this.state.ex2Pronoun}
                    human="true"
                  />{' '}
                  <fbt:enum
                    enum-range={ExampleEnum}
                    value={this.state.ex2Object}
                  />.
                </fbt> */}
                {/* Auto-parameterization */}
                {/* <fbt desc="Example enum & pronoun">
                  <fbt:param name="name">
                    <b className="padRight">
                      <a href="#">{this.state.ex2Name}</a>
                    </b>
                  </fbt:param>
                  has a
                  <fbt:enum
                    enum-range={ExampleEnum}
                    value={this.state.ex2Object}
                  />
                  to share!{' '}
                  <b className="pad">
                    <a href="#">View</a>
                  </b>{' '}
                  <fbt:pronoun
                    type="possessive"
                    gender={this.state.ex2Pronoun}
                    human="true"
                  />{' '}
                  <fbt:enum
                    enum-range={ExampleEnum}
                    value={this.state.ex2Object}
                  />.
                </fbt> */}
              </span>
            </fieldset>
            <fieldset>
              <span className="example_row">
                <button
                  className="bottom"
                  type="submit"
                  onClick={e => {
                    window.open(
                      'https://github.com/facebook/fbt',
                      '_blank',
                    );
                  }}>
                  Try it out!
                  {/* {fbt('Try it out!', 'Sign up button')} */}
                </button>
              </span>
            </fieldset>
          </form>
        </div>
        <ul className="languages">
          {Object.keys(LOCALES).map(loc => (
            <li key={loc} value={loc}>
              {locale === loc ? (
                LOCALES[loc].displayName
              ) : (
                <a
                  href={`#${loc}`}
                  onClick={(event /*: SyntheticUIEvent<> */) => {
                    event.preventDefault();
                    this.setLocale(loc);
                  }}>
                  {LOCALES[loc].displayName}
                </a>
              )}
            </li>
          ))}
        </ul>
        <p className="copyright">{`Facebook \u00A9 2018`}</p>
      </div>
    );
  }
}
