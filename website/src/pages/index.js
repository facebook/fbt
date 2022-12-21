/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

import CodeBlock from '../components/CodeBlock';
import Showcase from '../components/Showcase';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import classnames from 'classnames';
import React from 'react';

const features = [
  {
    title: <>Inlined translatable text</>,
    description: (
      <>
        Compose translatable text inline with your source:
        <CodeBlock
          code={`<button>
  <fbt desc="Canonical intro text">
    Hello World!
  </fbt>
</button>`}
        />
      </>
    ),
  },
  {
    title: <>Seamless text collection</>,
    description: (
      <>
        Collect your translatable source texts with ease:
        <CodeBlock
          code={`{
  "hashToText":{
    "ni7kanCF2RfGZAS9mDOToQ==":
    "Hello, World!"
  },
  ...,
  "desc": "Canonical intro text"
}`}
        />
      </>
    ),
  },
  {
    title: <>Integrated translations</>,
    description: (
      <>
        Easily pull translations into your app
        <CodeBlock code={`<button>Hello, Byd!</button>`} />
      </>
    ),
  },
];

const Features = () =>
  features && features.length ? (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {features.map(({description, title}, idx) => (
            <div
              className={classnames('col col--4', styles.featureBlock)}
              key={idx}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ) : null;

const Description = () => (
  <section className={styles.description}>
    <div className={classnames('row', styles.row)}>
      <div className={classnames('col', styles.column)}>
        <h2>Why FBT?</h2>
        <div>
          FBT is a framework for internationalizing user interfaces in
          JavaScript. It is designed to be not only powerful and flexible, but
          also simple and intuitive. Getting grammatically correct translated
          texts in dynamic applications is hard. Let FBT do the hard work for
          you.
        </div>
      </div>
      <div className={classnames('col', styles.column)}>
        <div className="splash_image">
          <img
            className={styles.descriptionImage}
            src={useBaseUrl('img/fbt.png')}
          />
        </div>
      </div>
    </div>
  </section>
);

const Index = () => {
  const {siteConfig = {}} = useDocusaurusContext();

  return (
    <Layout
      description={siteConfig.tagline}
      title={`${siteConfig.title} - ${siteConfig.tagline}`}>
      <header className={classnames('hero hero--primary', styles.heroBanner)}>
        <div className={classnames('container', styles.topContainer)}>
          <div>
            <h1 className="hero__title">{siteConfig.title}</h1>
            <div className={styles.sections}>
              <div>
                <p className="hero__subtitle">
                  An internationalization framework
                </p>
                <div className={styles.buttons}>
                  <Link
                    className={classnames(
                      'button button--secondary button--lg',
                      styles.button,
                    )}
                    to="https://github.com/facebook/fbt">
                    Try it out
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="splash_image">
            <img
              className={styles.splashImage}
              src={useBaseUrl('img/fbt.png')}
            />
          </div>
        </div>
      </header>
      <main>
        <Features />
        <Description />
        <Showcase />
      </main>
    </Layout>
  );
};

export default Index;
