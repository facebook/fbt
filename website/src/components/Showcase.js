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

import styles from '../pages/styles.module.css';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import classnames from 'classnames';
import React from 'react';

const Showcase = ({showAll = false}) => {
  const {siteConfig = {}} = useDocusaurusContext();
  const {users} = siteConfig.customFields;

  const showcase = (showAll ? users : users.filter(user => user.pinned)).map(
    (user, i) => {
      return (
        <a className={styles.showcaseLogo} href={user.infoUrl} key={i}>
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
