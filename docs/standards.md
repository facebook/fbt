---
id: standards
title: i18n standards
sidebar_label: On i18n standards
---

## Locales
Facebook uses a `xx_XX` format for representing locales like: `en_US`, `jp_JP`, etc.  We're actively working on separating our `language` + `country` combinations internally, and where we go from there as far as standards go is unknown. BUT if you'd like to help support `bcp-47` standards or similar, you are very welcome to contribute!

## CLDR
We generate all our number variation data found in our `IntlNumberTypes` internals from [CLDR (Unicode Common Locale Data Repository)](http://cldr.unicode.org/).
