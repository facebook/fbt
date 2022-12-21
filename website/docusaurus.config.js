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

module.exports = {
  title: 'FBT',
  tagline: 'An internationalization framework',
  url: 'https://facebook.github.io',
  baseUrl: '/fbt/',
  favicon: 'img/favicon_blue.png',
  projectName: 'fbt',
  organizationName: 'facebook',
  scripts: ['https://buttons.github.io/buttons.js'],
  customFields: {
    users: [
      {
        caption: 'Facebook',
        imageUrl: 'img/flogo_RGB_HEX-72.svg',
        infoUrl: 'https://www.facebook.com',
        pinned: true,
      },
    ],
  },
  themeConfig: {
    announcementBar: {
      id: 'support_ukraine',
      content:
        'Support Ukraine 🇺🇦 <a target="_blank" rel="noopener noreferrer" href="https://opensource.fb.com/support-ukraine"> Help Provide Humanitarian Aid to Ukraine</a>.',
      backgroundColor: '#20232a',
      textColor: '#fff',
      isCloseable: false,
    },
    navbar: {
      title: 'FBT',
      logo: {
        alt: 'FBT Logo',
        src: 'img/fbt.png',
      },
      items: [
        {to: 'docs/getting_started_on_web', label: 'Docs', position: 'right'},
        {to: 'help', label: 'Help', position: 'right'},
        {
          href: 'https://github.com/facebook/fbt',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Facebook Open Source Logo',
        src: 'img/oss_logo.png',
        href: 'https://opensource.facebook.com/',
      },
      copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Getting Started', to: 'docs/getting_started_on_web'},
            {label: 'Help', to: 'help'},
            {
              label: 'API Reference',
              to: 'docs/api_intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'User Showcase', to: 'users'},
            {
              label: 'Stack Overflow',
              href: 'http://stackoverflow.com/questions/tagged/fbt',
            },
            {
              label: 'Discord Channel',
              href: 'https://discord.gg/cQvXZr5',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/fbt_js',
            },
          ],
        },
        {
          title: 'Legal',
          // Please do not remove the privacy and terms, it's a legal requirement.
          items: [
            {
              label: 'Privacy',
              href: 'https://opensource.facebook.com/legal/privacy/',
              target: '_blank',
              rel: 'noreferrer noopener',
            },
            {
              label: 'Terms',
              href: 'https://opensource.facebook.com/legal/terms/',
              target: '_blank',
              rel: 'noreferrer noopener',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Blog', to: 'blog'},
            {
              label: 'Github',
              href: 'https://github.com/facebook/fbt',
            },
          ],
        },
      ],
    },
    image: 'img/fbt.png',
    algolia: {
      apiKey: '5c2d8a0fd96316854e1f0eabd60c39ec',
      indexName: 'fbt',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: '../docs',
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
