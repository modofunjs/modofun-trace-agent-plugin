# modofun-trace-agent-plugin
Modofun plugin for the Google Cloud Stackdriver Trace agent

Add the following to the top of your Google Cloud Function:

``js
require('@google-cloud/trace-agent').start({
    plugins: { 'modofun': 'modofun-trace-agent-plugin' }
  });
``

This will enable tracing of all requests on Google Cloud Stackdriver Trace when using modofun.

## Installation

```bash
$ npm install modofun-trace-agent-plugin
```

Or

```bash
$ yarn add modofun-trace-agent-plugin
```
