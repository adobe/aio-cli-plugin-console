<!--
Copyright 2020 Adobe. All rights reserved.
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
@adobe/aio-cli-plugin-console/3.0.0 darwin-x64 node-v10.18.1
$ ./bin/run --help [COMMAND]
USAGE
  $ ./bin/run COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
- [aio-cli-plugin-console](#aio-cli-plugin-console)
- [Usage](#usage)
- [Commands](#commands)
  - [`./bin/run console`](#binrun-console)
  - [`./bin/run console:org:list`](#binrun-consoleorglist)
  - [`./bin/run console:project:list`](#binrun-consoleprojectlist)
  - [`./bin/run console:workspace:list`](#binrun-consoleworkspacelist)

## `./bin/run console`

Console plugin for the Adobe I/O Console

```
USAGE
  $ ./bin/run console

EXAMPLE
  $ aio console:org:list
```

_See code: [src/commands/console/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.0/src/commands/console/index.js)_

## `./bin/run console:org:list`

add your description here

```
USAGE
  $ ./bin/run console:org:list

ALIASES
  $ ./bin/run org:list
```

_See code: [src/commands/console/org/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.0/src/commands/console/org/list.js)_

## `./bin/run console:project:list`

add your description here

```
USAGE
  $ ./bin/run console:project:list

ALIASES
  $ ./bin/run project:list
```

_See code: [src/commands/console/project/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.0/src/commands/console/project/list.js)_

## `./bin/run console:workspace:list`

add your description here

```
USAGE
  $ ./bin/run console:workspace:list

ALIASES
  $ ./bin/run workspace:list
```

_See code: [src/commands/console/workspace/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.0/src/commands/console/workspace/list.js)_
<!-- commandsstop -->
