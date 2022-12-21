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

import React from 'react';
import classnames from 'classnames';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from '../pages/styles.module.css';

const Showcase = ({showAll = false}) => {
  const {siteConfig = {}} = useDocusaurusContext();
  const {users} = siteConfig.customFields;

  const showcase = (showAll ? users : users.filter(user => user.pinned)).map(
    (user, i) => {
      return (
        <a key={i} className={styles.showcaseLogo} href={user.infoUrl}>
          <img src={useBaseUrl(user.imageUrl)} title={user.caption} />
        </a>
      );
    },
  );

  return (
    <section
      className={classnames('text--center margin-top--xl', styles.showcase)}>
      <h2
        className={classnames(
          'showcaseHeading',
          styles.showcaseHeadingColored,
        )}>
        Who's Using This?
      </h2>
      <div className={styles.showcaseLogos}>{showcase}</div>
      {showAll && <p>Are you using this project?</p>}
      <div className="more-users">
        {showAll ? (
          <Link
            className={classnames(
              'button button--primary button--outline',
              styles.button,
            )}
            href="https://github.com/facebook/fbt/edit/main/website/docusaurus.config.js">
            Add your company/project
          </Link>
        ) : (
          <Link
            className={classnames(
              'button button--primary button--outline',
              styles.button,
            )}
            to={useBaseUrl('users')}>
            More {siteConfig.title} Users
          </Link>
        )}
      </div>
    </section>
  );
};

export default Showcase;
