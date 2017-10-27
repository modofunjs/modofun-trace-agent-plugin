# mod:o:fun plugin for Google Stackdriver Trace

[![Build Status](https://travis-ci.org/fptavares/modofun-trace-agent-plugin.svg?branch=master)](https://travis-ci.org/fptavares/modofun-trace-agent-plugin)
[![npm](https://img.shields.io/npm/v/modofun-trace-agent-plugin.svg)](https://www.npmjs.com/package/modofun-trace-agent-plugin)

A plugin for the Google Stackdriver Trace agent to enable tracing of requests handled by [modofun](https://github.com/fptavares/modofun).

Just add the following to the top of your Google Cloud Function:

```js
require('@google-cloud/trace-agent').start({
    plugins: { 'modofun': 'modofun-trace-agent-plugin' }
  });
```

This will enable tracing of all requests on Stackdriver Trace.

## Installation

```bash
$ npm install modofun-trace-agent-plugin
```

Or

```bash
$ yarn add modofun-trace-agent-plugin
```
