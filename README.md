# mod:o:fun plugin for Google Stackdriver Trace

A plugin for the Google Stackdriver Trace agent to enable tracing of requests handled by [modofun](https://github.com/modofunjs/modofun).

[![Build Status](https://travis-ci.org/modofunjs/modofun-trace-agent-plugin.svg?branch=master)](https://travis-ci.org/modofunjs/modofun-trace-agent-plugin)
[![Coverage Status](https://coveralls.io/repos/github/modofunjs/modofun-trace-agent-plugin/badge.svg?branch=master)](https://coveralls.io/github/modofunjs/modofun-trace-agent-plugin?branch=master)
[![npm](https://img.shields.io/npm/v/modofun-trace-agent-plugin.svg)](https://www.npmjs.com/package/modofun-trace-agent-plugin)

Just add the following to the top of your Google Cloud Function:

```js
require('@google-cloud/trace-agent').start({
    plugins: { 'modofun': 'modofun-trace-agent-plugin' }
  });
```

This will enable tracing of all requests on Stackdriver Trace.

## Installation

You can install it using [npm](https://www.npmjs.com):

```bash
$ npm install modofun-trace-agent-plugin
```

Or [yarn](https://yarnpkg.com):

```bash
$ yarn add modofun-trace-agent-plugin
```
