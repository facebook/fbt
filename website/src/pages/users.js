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

import Showcase from '../components/Showcase';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React from 'react';

const Users = () => {
  const {siteConfig = {}} = useDocusaurusContext();

  return (
    <Layout
      description={siteConfig.tagline}
      title={`${siteConfig.title} - ${siteConfig.tagline}`}>
      <Showcase showAll />
    </Layout>
  );
};

export default Users;
