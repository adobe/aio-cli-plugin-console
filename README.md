<!--
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@adobe/aio-cli-plugin-console.svg)](https://npmjs.org/package/@adobe/aio-cli-plugin-console)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-cli-plugin-console.svg)](https://npmjs.org/package/@adobe/aio-cli-plugin-console)
[![Build Status](https://travis-ci.com/adobe/aio-cli-plugin-console.svg?branch=master)](https://travis-ci.com/adobe/aio-cli-plugin-console)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![Greenkeeper badge](https://badges.greenkeeper.io/adobe/aio-cli-plugin-console.svg)](https://greenkeeper.io/)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-cli-plugin-console/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-cli-plugin-console/)


aio-cli-plugin-console
======================

Console Integration Plugin for the Adobe I/O CLI

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @adobe/aio-cli-plugin-console
$ ./bin/run COMMAND
running command...
$ ./bin/run (-v|--version|version)
@adobe/aio-cli-plugin-console/2.0.0 darwin-x64 node-v8.11.4
$ ./bin/run --help [COMMAND]
USAGE
  $ ./bin/run COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`./bin/run console`](#binrun-console)
* [`./bin/run console:integration NAMESPACE`](#binrun-consoleintegration-namespace)
* [`./bin/run console:list-integrations`](#binrun-consolelist-integrations)
* [`./bin/run console:reset-integration [INTEGRATION_ID]`](#binrun-consolereset-integration-integration_id)
* [`./bin/run console:select-integration [INTEGRATION_ID]`](#binrun-consoleselect-integration-integration_id)
* [`./bin/run console:selected-integration`](#binrun-consoleselected-integration)

## `./bin/run console`

List or select console integrations for the Adobe I/O Runtime

```
USAGE
  $ ./bin/run console

OPTIONS
  -n, --name                   sort results by name
  -p, --passphrase=passphrase  the passphrase for the private-key

ALIASES
  $ ./bin/run console:ls
  $ ./bin/run console:list

EXAMPLES
  $ aio console:list-integrations
  $ aio console:ls
  $ aio console list-integrations
  $ aio console:select-integration INTEGRATION_ID
  $ aio console:sel INTEGRATION_ID
  $ aio console select-integration INTEGRATION_ID
  $ aio console:reset-integration INTEGRATION_ID
  $ aio console:reset INTEGRATION_ID
  $ aio console reset-integration INTEGRATION_ID
  $ aio console:current-integration
  $ aio console:current
  $ aio console current-integration
```

_See code: [src/commands/console/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/v2.0.0/src/commands/console/index.js)_

## `./bin/run console:integration NAMESPACE`

Views an integration for use with Adobe I/O Runtime serverless functions

```
USAGE
  $ ./bin/run console:integration NAMESPACE

ARGUMENTS
  NAMESPACE  namespace of an integration

OPTIONS
  -p, --passphrase=passphrase  the passphrase for the private-key

ALIASES
  $ ./bin/run console:get
  $ ./bin/run console:int
```

_See code: [src/commands/console/integration.js](https://github.com/adobe/aio-cli-plugin-console/blob/v2.0.0/src/commands/console/integration.js)_

## `./bin/run console:list-integrations`

lists integrations for use with Adobe I/O Runtime serverless functions

```
USAGE
  $ ./bin/run console:list-integrations

OPTIONS
  -n, --name                   sort results by name
  -p, --passphrase=passphrase  the passphrase for the private-key

ALIASES
  $ ./bin/run console:ls
  $ ./bin/run console:list
```

_See code: [src/commands/console/list-integrations.js](https://github.com/adobe/aio-cli-plugin-console/blob/v2.0.0/src/commands/console/list-integrations.js)_

## `./bin/run console:reset-integration [INTEGRATION_ID]`

resets an integration's .wskprops auth hash.

```
USAGE
  $ ./bin/run console:reset-integration [INTEGRATION_ID]

DESCRIPTION
  after running this command all clients will need to run `console:select-integration` 
  to get a new auth hash in their .wskprops file

ALIASES
  $ ./bin/run console:reset
```

_See code: [src/commands/console/reset-integration.js](https://github.com/adobe/aio-cli-plugin-console/blob/v2.0.0/src/commands/console/reset-integration.js)_

## `./bin/run console:select-integration [INTEGRATION_ID]`

selects an integration and writes the .wskprops file to the local machine

```
USAGE
  $ ./bin/run console:select-integration [INTEGRATION_ID]

OPTIONS
  -f, --force                  do not prompt if the .wskprops file exists
  -g, --global                 save selected integration to global config
  -l, --local                  save selected integration to local config
  -p, --passphrase=passphrase  the passphrase for the private-key
  -w, --wskprops               save selected integration to .wskprops file (default)

DESCRIPTION
  Run 'console:ls' to get a list of integrations to select from.
  The .wskprops file will be written to your home folder, and you will be prompted whether you want to overwrite an 
  existing file.

ALIASES
  $ ./bin/run console:sel
  $ ./bin/run console:select
```

_See code: [src/commands/console/select-integration.js](https://github.com/adobe/aio-cli-plugin-console/blob/v2.0.0/src/commands/console/select-integration.js)_

## `./bin/run console:selected-integration`

lists the selected integration for use with Adobe I/O Runtime serverless functions

```
USAGE
  $ ./bin/run console:selected-integration

OPTIONS
  -p, --passphrase=passphrase  the passphrase for the private-key

ALIASES
  $ ./bin/run console:selected
  $ ./bin/run console:current
```

_See code: [src/commands/console/selected-integration.js](https://github.com/adobe/aio-cli-plugin-console/blob/v2.0.0/src/commands/console/selected-integration.js)_
<!-- commandsstop -->
