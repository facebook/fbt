/**
 * Copyright (c) Facebook, Inc. and its affiliates. All rights reserved.
 *
 * @flow strict-local
 * @fbt {"project": "fbt-demo-project"}
 */

import * as React from 'react';

const fbt = require('fbt');
const IntlViewerContext = require('IntlViewerContext');
import classNames from 'classnames';
const IntlVariations = require('IntlVariations');
const ExampleEnum = require('Example$FbtEnum');
const GenderConst = require('GenderConst');

import './css/Example.css';

const LOCALES = Object.freeze({
  en_US: Object.freeze({
    bcp47: 'en-US',
    displayName: 'English (US)',
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
    displayName: 'Español',
    englishName: 'Spanish',
    rtl: false,
  }),
  ar_AR: Object.freeze({
    bcp47: 'ar',
    displayName: 'العربية',
    englishName: 'Arabic',
    rtl: true,
  }),
  he_IL: Object.freeze({
    bcp47: 'he',
    displayName: 'עברית',
    englishName: 'Hebrew',
    rtl: true,
  }),
  ja_JP: Object.freeze({
    bcp47: 'ja',
    displayName: '日本語',
    englishName: 'Japanese',
    rtl: false,
  }),
});

type Locale = $Keys<typeof LOCALES>;
type Variation = $Values<typeof IntlVariations>;
type SharedObj = $Keys<typeof ExamplEnum>;
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
    vcGender: IntlVariations.GENDER_UNKNOWN,
    ex1Name: 'Someone',
    ex1Gender: IntlVariations.GENDER_UNKNOWN,
    ex1Count: 1,
    ex2Name: "Someone",
    ex2Object: "LINK",
    ex2Pronoun: GenderConst.UNKNOWN_SINGULAR,
  };

  setLocale = (locale: Locale) => {
    IntlViewerContext.locale = locale;
    this.setState({locale});
    const html = document.getElementsByTagName('html')[0];
    if (html != null) {
      html.lang = LOCALES[locale].bcp47;
    }
    document.body.direction = LOCALES[locale].rtl;
  };

  onSubmit = (event: SyntheticInputEvent<>) => {
    event.stopPropagation();
    event.preventDefault();
  };

  render() {
    const {locale} = this.state;

    return (
      <div>
        <div className="example">
          <div className="warning">
            <fbt desc="title">Your FBT Demo</fbt>
          </div>
          <h1><fbt desc="header">Construct sentences</fbt></h1>
          <h2><fbt desc="yet another header">Use the form below to see FBT in action.</fbt></h2>
          <form action="" method="get" onSubmit={this.onSubmit}>
            <fieldset>
              <span className="example__row">
                <span className="example__input--30">
                <select className="neatoSelect"
                  onChange={(event: SyntheticUIEvent<>) => {
                    const vcGender = parseInt(event.target.value);
                    IntlViewerContext.GENDER = vcGender;
                    this.setState({vcGender});
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
              <span
                className={classNames('example__row', 'example__row--multi')}>
                <span
                  className={classNames(
                    'example__input',
                    'example__input--40',
                  )}>
                  <input
                    name="name"
                    placeholder={fbt('name', 'name field')}
                    tabIndex={1}
                    onChange={(event: SyntheticUIEvent<>) => {
                      this.setState({ex1Name: event.target.value});
                    }}
                    type="text"
                  />
                </span>
                <span
                  className={classNames(
                    'example__input',
                    'example__input--30',
                  )}>

                  <input
                    name="count"
                    placeholder={fbt('count', 'count field')}
                    onChange={(event: SyntheticUIEvent<>) => {
                      this.setState({ex1Count: parseInt(event.target.value) || 1});
                    }}
                    tabIndex={1}
                    type="number"
                  />
                </span>
                <span className="example__row">
                  <select className="neatoSelect"
                    onChange={(event: SyntheticUIEvent<>) => {
                      this.setState({ex1Gender: parseInt(event.target.value)});
                    }}>
                    <option value={IntlVariations.GENDER_UNKNOWN}>
                      <fbt desc="Gender Select label">Gender:</fbt>
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
              <span className="sentence example__row">
                <fbt desc="example 1">
                  <fbt:param name="name" gender={this.state.ex1Gender}>
                    <b className="padRight">{this.state.ex1Name}</b>
                  </fbt:param>
                  has shared
                  <a className="neatoLink" href="#">
                    <fbt:plural many="photos" showCount="ifMany" count={this.state.ex1Count}>
                      a photo
                    </fbt:plural>
                  </a>
                  with you
                </fbt>
              </span>
           </fieldset>

            <fieldset>
              <span
                className={classNames('example__row', 'example__row--multi')}>
                <span
                  className={classNames(
                    'example__input',
                    'example__input--40',
                  )}>
                  <input
                    name="ex2Name"
                    placeholder={fbt('name', 'name field')}
                    tabIndex={1}
                    onChange={(event: SyntheticUIEvent<>) => {
                      this.setState({ex2Name: event.target.value});
                    }}
                    type="text"
                  />
                </span>
                <span
                  className={classNames(
                    'example__input',
                    'example__input--20',
                  )}>
                  <select className="neatoSelect"
                    onChange={(event: SyntheticUIEvent<>) => {
                      this.setState({ex2Object: event.target.value});
                    }}>
                    {Object.keys(ExampleEnum).map(k =>
                      <option key={k} value={k}>{ExampleEnum[k]}</option>)}
                  </select>
                </span>
                <span className={classNames('example__row', 'example__input--20')}>
                  <select className="neatoSelect"
                    onChange={(event: SyntheticUIEvent<>) => {
                      this.setState({ex2Pronoun: parseInt(event.target.value)});
                    }}>
                    <option value={GenderConst.UNKNOWN_PLURAL}>
                      <fbt desc="Gender Select label">Gender:</fbt>
                    </option>
                    <option value={GenderConst.NOT_A_PERSON}>
                      <fbt desc="Gender Select label">Not a person</fbt>
                    </option>
                    <option value={GenderConst.UNKNOWN_PLURAL}>
                      <fbt desc="Gender Select label">Unknown (Plural)</fbt>
                    </option>
                    <option value={GenderConst.UNKNOWN_SINGULAR}>
                      <fbt desc="Gender Select label">Unknown (singular)</fbt>
                    </option>
                    <option value={GenderConst.MALE_SINGULAR}>
                      <fbt desc="Gender Select label">Male (singular)</fbt>
                    </option>
                    <option value={GenderConst.FEMALE_SINGULAR}>
                      <fbt desc="Gender Select label">Female (singular)</fbt>
                    </option>
                  </select>
                </span>
              </span>
            </fieldset>
            <fieldset>
              <span className="sentence example__row">
                <fbt desc="Example enum & pronoun">
                  <fbt:param name="name">
                    <b className="padRight" ><a href="#">{this.state.ex2Name}</a></b>
                  </fbt:param>
                  has a
                  <fbt:enum enum-range={ExampleEnum} value={this.state.ex2Object} />
                  to share!{' '}
                  <b className="pad"><a href="#">View</a></b>
                  {' '}<fbt:pronoun type="possessive" gender={this.state.ex2Pronoun} human="true" />
                  {' '}
                  <fbt:enum enum-range={ExampleEnum} value={this.state.ex2Object} />.
                </fbt>
              </span>
            </fieldset>
            <fieldset>
              <span className="example__row">
                <button className="bottom" tabIndex={1} type="submit">
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
                  }}
                  tabIndex={2}>
                  {LOCALES[loc].displayName}
                </a>
              )}
            </li>
          ))}
        </ul>
        <p className="copyright">{`Facebook © 2018`}</p>
      </div>
    );
  }
}
