<p class="hr">
  <a href="https://www.npmjs.com/package/babel-plugin-fbt-runtime">
    <img src="https://badge.fury.io/js/babel-plugin-fbt-runtime.svg" alt="npm version" />
  </a>

  <a href="https://twitter.com/fbt_js">
    <img src="https://img.shields.io/twitter/follow/fbt_js.svg?style=social" align="right" alt="Twitter Follow" />
  </a>

  <a href="https://discord.gg/cQvXZr5">
    <img src="https://img.shields.io/discord/102860784329052160.svg" align="right" alt="Discord Chat" />
  </a>

  <a href="https://www.facebook.com/groups/498204277369868">
    <img src="https://img.shields.io/badge/Facebook-Group-blue" align="right" alt="Facebook Group" />
  </a>
</p>

<h1 align="center">
  <img src="https://facebook.github.io/fbt/img/fbt.png" height="150" width="150" alt="FBT"/>
</h1>

## FBT Babel Runtime transform

This is the *secondary* FBT Babel transform.  Because of the way `fbt` is used internally at Facebook, by itself, the [fbt-babel-plugin](https://www.npmjs.com/package/babel-plugin-fbt-runtime) does not transpile `fbt._(...)` arguments to payloads that the [fbt runtime](https://www.npmjs.com/package/fbt) understands.  This transform takes care of that.

## Full documentation
https://facebook.github.io/fbt
