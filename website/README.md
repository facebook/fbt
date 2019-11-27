This website was created with [Docusaurus](https://docusaurus.io/).

# What's In This Document

* [Get Started in 5 Minutes](#get-started-in-5-minutes)
* [Directory Structure](#directory-structure)
* [Editing Content](#editing-content)
* [Adding Content](#adding-content)
* [Full Documentation](#full-documentation)

# Get Started in 5 Minutes

1. Make sure all the dependencies for the website are installed:

```sh
# Install dependencies
$ yarn
```
2. Run your dev server:

```sh
# Start the site
$ yarn start
```

## Directory Structure

Your project file structure should look something like this

```
my-docusaurus/
  docs/
    doc-1.md
    doc-2.md
    doc-3.md
  website/
    blog/
      2016-3-11-oldest-post.md
      2017-10-24-newest-post.md
    node_modules/
    src/
      components/
      css/
      pages/
    static/
      css/
      img/
    docusaurus.config.js
    package.json
    sidebar.js
```

# Editing Content

## Editing an existing docs page

Edit docs by navigating to `docs/` and editing the corresponding document:

`docs/doc-to-be-edited.md`

```markdown
---
id: page-needs-edit
title: This Doc Needs To Be Edited
---

Edit me...
```

For more information about docs, click [here](https://v2.docusaurus.io/docs/markdown-features)

## Editing an existing blog post

Edit blog posts by navigating to `website/blog` and editing the corresponding post:

`website/blog/post-to-be-edited.md`
```markdown
---
id: post-needs-edit
title: This Blog Post Needs To Be Edited
---

Edit me...
```

For more information about blog posts, click [here](https://v2.docusaurus.io/docs/blog)

# Adding Content

## Adding a new docs page to an existing sidebar

1. Create the doc as a new markdown file in `/docs`, example `docs/newly-created-doc.md`:

```md
---
id: newly-created-doc
title: This Doc Needs To Be Edited
---

My new content here..
```

1. Refer to that doc's ID in an existing sidebar in `website/sidebar.js`:

```javascript
// Add newly-created-doc to the Getting Started category of docs
{
  "docs": {
    "Getting Started": [
      "quick-start",
      "newly-created-doc" // new doc here
    ],
    ...
  },
  ...
}
```

For more information about adding new docs, click [here](https://v2.docusaurus.io/docs/markdown-features)

## Adding a new blog post

1. Make sure there is a header link to your blog in `website/docusaurus.config.js`:

`website/docusaurus.config.js`
```javascript
headerLinks: [
    ...
    { blog: true, label: 'Blog' },
    ...
]
```

2. Create the blog post with the format `YYYY-MM-DD-My-Blog-Post-Title.md` in `website/blog`:

`website/blog/2018-05-21-New-Blog-Post.md`

```markdown
---
author: Frank Li
authorURL: https://twitter.com/foobarbaz
authorFBID: 503283835
title: New Blog Post
---

Lorem Ipsum...
```

For more information about blog posts, click [here](https://v2.docusaurus.io/docs/blog)

## Adding items to your site's top navigation bar

1. Add links to docs, custom pages or external links by editing the headerLinks field of `website/docusaurus.config.js`:

`website/docusaurus.config.js`
```javascript
{
  themeConfig: {
    navbar: {
      links: [
        /* you can add docs */
        { doc: 'my-examples', label: 'Examples' },
        /* you can add custom pages */
        { page: 'help', label: 'Help' },
        /* you can add external links */
        { href: 'https://github.com/facebook/Docusaurus', label: 'GitHub' },
        ...
      ]
    }
    ...
  },
  ...
}
```

For more information about the navigation bar, click [here](https://v2.docusaurus.io/docs/theme-classic/#navbar-links)

## Adding custom pages

1. Docusaurus uses React components to build pages. The components are saved as .js files in `website/src/pages`:
1. If you want your page to show up in your navigation header, you will need to update `website/docusaurus.config.js` to add to the `links` element:

`website/docusaurus.config.js`
```javascript
{
  themeConfig: {
    navbar: {
      links: [
        { page: 'my-new-custom-page', label: 'My New Custom Page' },
      ],
      ...
    },
    ...
  },
  ...
}
```

For more information about custom pages, click [here](https://v2.docusaurus.io/docs/creating-pages).

# Full Documentation

Full documentation can be found on the [website](https://v2.docusaurus.io/).
