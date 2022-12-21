/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @fbt {"project": "fbt-demo-project"}
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

/* eslint-disable fb-flow/use-exact-by-default-object-type */

import './css/Example.css';
import classNames from 'classnames';
import {GenderConst, IntlVariations, fbs, fbt, init} from 'fbt';
import * as React from 'react';

// eslint-disable-next-line fb-www/no-module-aliasing
const ExampleEnum = require('./Example$FbtEnum');

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
  fb_HX: Object.freeze({
    bcp47: 'fb-HX',
    displayName: 'l33t 5p34k',
    englishName: 'FB H4x0r',
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
  ru_RU: Object.freeze({
    bcp47: 'ru',
    displayName: 'Русский',
    englishName: 'Russian',
    rtl: false,
  }),
});

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

export default class Example extends React.Component<Props, State> {
  state = {
    locale: 'en_US',
    ex1Name: 'Someone',
    ex1Gender: IntlVariations.GENDER_UNKNOWN,
    ex1Count: 1,
    ex2Name: 'Someone',
    ex2Object: 'LINK',
    ex2Pronoun: GenderConst.UNKNOWN_SINGULAR,
  };

  setLocale(locale: Locale) {
    viewerContext.locale = locale;
    this.setState({locale});
    const html = document.getElementsByTagName('html')[0];
    if (html != null) {
      html.lang = LOCALES[locale].bcp47;
    }
    document.body.className = LOCALES[locale].rtl ? 'rtl' : 'ltr';
  }

  onSubmit(event: SyntheticInputEvent<>) {
    event.stopPropagation();
    event.preventDefault();
  }

  render() {
    const {locale} = this.state;

    return (
      <div>
        <div className="example">
          <div className="warning">
            <fbt desc="title">Your FBT Demo</fbt>
          </div>
          <h1>
            <fbt desc="header">Construct sentences</fbt>
          </h1>
          <h2>
            {/* For fbt common strings, the description will be sourced from an external manifest.
            See `--fbt-common-path` option from `fbt-collect` and common_strings.json */}
            <fbt common>Use the form below to see FBT in action.</fbt>
          </h2>
          <form action="" method="get" onSubmit={this.onSubmit}>
            <fieldset>
              <span className="example_row">
                <span className="example_input--30">
                  <select
                    className="neatoSelect"
                    onChange={(event: SyntheticUIEvent<>) => {
                      const vcGender = parseInt(event.target.value, 10);
                      viewerContext.GENDER = vcGender;
                      this.forceUpdate();
                    }}>
                    <option value={IntlVariations.GENDER_UNKNOWN}>
                      <fbt desc="Gender Select label">Your Gender:</fbt>
                    </option>
                    <option value={IntlVariations.GENDER_UNKNOWN}>
                      <fbt desc="Unknown gender">Unknown</fbt>
                    </option>
                    <option value={IntlVariations.GENDER_MALE}>
                      <fbt desc="Male gender">Male</fbt>
                    </option>
                    <option value={IntlVariations.GENDER_FEMALE}>
                      <fbt desc="Female gender">Female</fbt>
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
                    onChange={(event: SyntheticUIEvent<>) => {
                      this.setState({ex1Name: event.target.value});
                    }}
                    placeholder={fbs('name', 'name field')}
                    type="text"
                  />
                </span>
                <span
                  className={classNames('example_input', 'example_input--30')}>
                  <input
                    name="count"
                    onChange={(event: SyntheticUIEvent<>) => {
                      const val = parseInt(event.target.value, 10);
                      this.setState({ex1Count: isNaN(val) ? 1 : val});
                    }}
                    placeholder={fbs('count', 'count field')}
                    type="number"
                  />
                </span>
                <span className="example_row">
                  <select
                    className="neatoSelect"
                    onChange={(event: SyntheticUIEvent<>) => {
                      this.setState({
                        ex1Gender: parseInt(event.target.value, 10),
                      });
                    }}>
                    <option value={IntlVariations.GENDER_UNKNOWN}>
                      <fbs desc="Gender Select label">Gender:</fbs>
                    </option>
                    <option value={IntlVariations.GENDER_UNKNOWN}>
                      <fbs desc="Unknown gender">Unknown</fbs>
                    </option>
                    <option value={IntlVariations.GENDER_MALE}>
                      <fbs desc="Male gender">Male</fbs>
                    </option>
                    <option value={IntlVariations.GENDER_FEMALE}>
                      <fbs desc="Female gender">Female</fbs>
                    </option>
                  </select>
                </span>
              </span>
            </fieldset>

            <fieldset>
              <span className="sentence example_row">
                <fbt desc="example 1">
                  <fbt:param gender={this.state.ex1Gender} name="name">
                    <b className="padRight">{this.state.ex1Name}</b>
                  </fbt:param>
                  has shared
                  <a className="neatoLink" href="#">
                    <fbt:plural
                      count={this.state.ex1Count}
                      many="photos"
                      showCount="ifMany">
                      a photo
                    </fbt:plural>
                  </a>
                  with you
                </fbt>
              </span>
            </fieldset>

            <fieldset>
              <span className={classNames('example_row', 'example_row--multi')}>
                <span
                  className={classNames('example_input', 'example_input--40')}>
                  <input
                    name="ex2Name"
                    onChange={(event: SyntheticUIEvent<>) => {
                      this.setState({ex2Name: event.target.value});
                    }}
                    placeholder={fbs('name', 'name field')}
                    type="text"
                  />
                </span>
                <span
                  className={classNames('example_input', 'example_input--20')}>
                  <select
                    className="neatoSelect"
                    onChange={(event: SyntheticUIEvent<>) => {
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
                    onChange={(event: SyntheticUIEvent<>) => {
                      this.setState({
                        ex2Pronoun: parseInt(event.target.value, 10),
                      });
                    }}>
                    <option value={GenderConst.UNKNOWN_PLURAL}>
                      <fbs desc="Gender Select label">Gender:</fbs>
                    </option>
                    <option value={GenderConst.NOT_A_PERSON}>
                      <fbs desc="Gender Select label">Not a person</fbs>
                    </option>
                    <option value={GenderConst.UNKNOWN_PLURAL}>
                      <fbs desc="Gender Select label">Unknown (Plural)</fbs>
                    </option>
                    <option value={GenderConst.UNKNOWN_SINGULAR}>
                      <fbs desc="Gender Select label">Unknown (singular)</fbs>
                    </option>
                    <option value={GenderConst.MALE_SINGULAR}>
                      <fbs desc="Gender Select label">Male (singular)</fbs>
                    </option>
                    <option value={GenderConst.FEMALE_SINGULAR}>
                      <fbs desc="Gender Select label">Female (singular)</fbs>
                    </option>
                  </select>
                </span>
              </span>
            </fieldset>
            <fieldset>
              <span className="sentence example_row">
                <fbt desc="Example enum & pronoun">
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
                    gender={this.state.ex2Pronoun}
                    human={false}
                    type="possessive"
                  />{' '}
                  <fbt:enum
                    enum-range={ExampleEnum}
                    value={this.state.ex2Object}
                  />.
                </fbt>
              </span>
            </fieldset>
            <fieldset>
              <span className="example_row">
                <button
                  className="bottom"
                  onClick={e => {
                    window.open('https://github.com/facebook/fbt', '_blank');
                  }}
                  type="submit">
                  {fbt('Try it out!', 'Sign up button')}
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
                  onClick={(event: SyntheticUIEvent<>) => {
                    event.preventDefault();
                    this.setLocale(loc);
                  }}>
                  {LOCALES[loc].displayName}
                </a>
              )}
            </li>
          ))}
        </ul>
        <p className="copyright">{`Facebook \u00A9 2021`}</p>
      </div>
    );
  }
}
