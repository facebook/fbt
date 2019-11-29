/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: "FBT",
  tagline: "An internationalization framework",
  url: "https://facebookincubator.github.io",
  baseUrl: "/fbt/",
  favicon: "img/favicon_blue.png",
  projectName: "fbt",
  organizationName: "facebookincubator",
  scripts: ["https://buttons.github.io/buttons.js"],
  customFields: {
    users: [
      {
        caption: "Facebook",
        imageUrl: "img/flogo_RGB_HEX-72.svg",
        infoUrl: "https://www.facebook.com",
        pinned: true
      }
    ]
  },
  themeConfig: {
    navbar: {
      title: "FBT",
      logo: {
        alt: "FBT Logo",
        src: "img/fbt.png"
      },
      links: [
        { to: "docs/getting_started", label: "Docs", position: "right" },
        { to: "help", label: "Help", position: "right" },
        {
          href: "https://github.com/facebookincubator/fbt",
          label: "GitHub",
          position: "right"
        }
      ]
    },
    footer: {
      style: "dark",
      logo: {
        alt: "Facebook Open Source Logo",
        src: "https://docusaurus.io/img/oss_logo.png",
        href: "https://opensource.facebook.com/"
      },
      copyright: `Copyright © ${new Date().getFullYear()} Facebook, Inc.`,
      links: [
        {
          title: "Docs",
          items: [
            { label: "Getting Started", to: "docs/getting_started" },
            { label: "Help", to: "help" },
            {
              label: "API Reference",
              to: "docs/api_intro"
            }
          ]
        },
        {
          title: "Community",
          items: [
            { label: "User Showcase", to: "users" },
            {
              label: "Stack Overflow",
              href: "http://stackoverflow.com/questions/tagged/fbt"
            },
            {
              label: "Discord Channel",
              href: "https://discord.gg/cQvXZr5"
            },
            {
              label: "Twitter",
              href: "https://twitter.com/fbt_js"
            }
          ]
        },
        {
          title: "More",
          items: [
            { label: "Blog", to: "blog" },
            {
              label: "Github",
              href: "https://github.com/facebookincubator/fbt"
            },
          ]
        }
      ]
    },
    image: "img/fbt.png"
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          path: "../docs",
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateAuthor: true,
          showLastUpdateTime: true
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css")
        }
      }
    ]
  ]
};
