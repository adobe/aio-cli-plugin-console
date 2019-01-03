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

[![Build Status](https://travis-ci.org/adobe/aio-cli-plugin-console.svg?branch=master)](https://travis-ci.org/adobe/aio-cli-plugin-console)
[![Build status](https://ci.appveyor.com/api/projects/status/uqfe3c8bcr3anbbp?svg=true)](https://ci.appveyor.com/project/shazron/aio-cli-plugin-console) [![Greenkeeper badge](https://badges.greenkeeper.io/adobe/aio-cli-plugin-console.svg)](https://greenkeeper.io/)

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
@adobe/aio-cli-plugin-console/1.1.1 darwin-x64 node-v8.11.2
$ ./bin/run --help [COMMAND]
USAGE
  $ ./bin/run COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`./bin/run console`](#bin-run-console)
* [`./bin/run console:list-integrations`](#bin-run-consolelist-integrations)
* [`./bin/run console:select-integration [INTEGRATION_ID]`](#bin-run-consoleselect-integration-integration-id)

## `./bin/run console`

List or select console integrations for the Adobe I/O Runtime

```
USAGE
  $ ./bin/run console

OPTIONS
  -p, --passphrase=passphrase  the passphrase for the private-key

EXAMPLES
  $ aio console:list-integrations
  $ aio console:ls
  $ aio console:select-integration INTEGRATION_ID
  $ aio console:sel INTEGRATION_ID
```

_See code: [src/commands/console/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/v1.1.1/src/commands/console/index.js)_

## `./bin/run console:list-integrations`

lists integrations for use with Adobe I/O Runtime serverless functions

```
USAGE
  $ ./bin/run console:list-integrations

OPTIONS
  -p, --page=page              [default: 1] page number
  -p, --passphrase=passphrase  the passphrase for the private-key
  -s, --pageSize=pageSize      [default: 20] size of a page (max 50)

ALIASES
  $ ./bin/run console:ls
```

_See code: [src/commands/console/list-integrations.js](https://github.com/adobe/aio-cli-plugin-console/blob/v1.1.1/src/commands/console/list-integrations.js)_

## `./bin/run console:select-integration [INTEGRATION_ID]`

selects an integration and writes the .wskprops file to the local machine

```
USAGE
  $ ./bin/run console:select-integration [INTEGRATION_ID]

OPTIONS
  -p, --passphrase=passphrase  the passphrase for the private-key
  -w, --overwrite              overwrite the .wskprops file if it exists

DESCRIPTION
  Run 'console:ls' to get a list of integrations to select from.
  The .wskprops file will be written to your home folder, and will overwrite the existing file.

ALIASES
  $ ./bin/run console:sel
```

_See code: [src/commands/console/select-integration.js](https://github.com/adobe/aio-cli-plugin-console/blob/v1.1.1/src/commands/console/select-integration.js)_
<!-- commandsstop -->
