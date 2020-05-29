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
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) 
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
$ aio COMMAND
running command...
$ aio (-v|--version|version)
@adobe/aio-cli-plugin-console/3.0.1 darwin-x64 node-v10.18.1
$ aio --help [COMMAND]
USAGE
  $ aio COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`aio console`](#aio-console)
* [`aio console:org`](#aio-consoleorg)
* [`aio console:org:list`](#aio-consoleorglist)
* [`aio console:org:select ORGCODE`](#aio-consoleorgselect-orgcode)
* [`aio console:project`](#aio-consoleproject)
* [`aio console:project:list`](#aio-consoleprojectlist)
* [`aio console:project:select PROJECTID`](#aio-consoleprojectselect-projectid)
* [`aio console:where`](#aio-consolewhere)
* [`aio console:workspace`](#aio-consoleworkspace)
* [`aio console:workspace:download [DESTINATION]`](#aio-consoleworkspacedownload-destination)
* [`aio console:workspace:list`](#aio-consoleworkspacelist)
* [`aio console:workspace:select WORKSPACEID`](#aio-consoleworkspaceselect-workspaceid)

## `aio console`

Console plugin for the Adobe I/O Console

```
USAGE
  $ aio console

OPTIONS
  --help  Show help
```

_See code: [src/commands/console/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/index.js)_

## `aio console:org`

Manage your Adobe I/O Console Organizations

```
USAGE
  $ aio console:org

OPTIONS
  --help  Show help
```

_See code: [src/commands/console/org/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/org/index.js)_

## `aio console:org:list`

List your Organizations

```
USAGE
  $ aio console:org:list

OPTIONS
  -j, --json  Output json
  -y, --yml   Output yml
  --help      Show help

ALIASES
  $ aio console:org:list
```

_See code: [src/commands/console/org/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/org/list.js)_

## `aio console:org:select ORGCODE`

Select an Organization

```
USAGE
  $ aio console:org:select ORGCODE

ARGUMENTS
  ORGCODE  Adobe I/O Org Code

OPTIONS
  --help  Show help

ALIASES
  $ aio console:org:select
  $ aio console:org:sel
```

_See code: [src/commands/console/org/select.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/org/select.js)_

## `aio console:project`

Manage your Adobe I/O Console Projects

```
USAGE
  $ aio console:project

OPTIONS
  --help  Show help
```

_See code: [src/commands/console/project/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/project/index.js)_

## `aio console:project:list`

List your Projects for the selected Organization

```
USAGE
  $ aio console:project:list

OPTIONS
  -j, --json     Output json
  -y, --yml      Output yml
  --help         Show help
  --orgId=orgId  OrgID for listing projects

ALIASES
  $ aio console:project:ls
```

_See code: [src/commands/console/project/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/project/list.js)_

## `aio console:project:select PROJECTID`

Select a Project for the selected Organization

```
USAGE
  $ aio console:project:select PROJECTID

ARGUMENTS
  PROJECTID  Adobe I/O Project Id

OPTIONS
  --help         Show help
  --orgId=orgId  OrgID of the project to select

ALIASES
  $ aio console:project:sel
```

_See code: [src/commands/console/project/select.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/project/select.js)_

## `aio console:where`

Show the currently selected Organization, Project and Workspace

```
USAGE
  $ aio console:where

OPTIONS
  -j, --json  Output json
  -y, --yml   Output yml
  --help      Show help

ALIASES
  $ aio where
```

_See code: [src/commands/console/where/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/where/index.js)_

## `aio console:workspace`

Manage your Adobe I/O Console Workspaces

```
USAGE
  $ aio console:workspace

OPTIONS
  --help  Show help

ALIASES
  $ aio console:ws
```

_See code: [src/commands/console/workspace/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/workspace/index.js)_

## `aio console:workspace:download [DESTINATION]`

Downloads the configuration for the selected Workspace

```
USAGE
  $ aio console:workspace:download [DESTINATION]

ARGUMENTS
  DESTINATION  path where workspace configuration file will be saved

OPTIONS
  --help  Show help

ALIASES
  $ aio console:workspace:download
  $ aio console:workspace:dl
  $ aio console:ws:download
  $ aio console:ws:dl
```

_See code: [src/commands/console/workspace/download.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/workspace/download.js)_

## `aio console:workspace:list`

List your Workspaces for your selected Project

```
USAGE
  $ aio console:workspace:list

OPTIONS
  -j, --json  Output json
  -y, --yml   Output yml
  --help      Show help

ALIASES
  $ aio console:workspace:list
  $ aio console:workspace:ls
  $ aio console:ws:list
  $ aio console:ws:ls
```

_See code: [src/commands/console/workspace/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/workspace/list.js)_

## `aio console:workspace:select WORKSPACEID`

Select a Workspace for the selected Project

```
USAGE
  $ aio console:workspace:select WORKSPACEID

OPTIONS
  --help  Show help

ALIASES
  $ aio console:workspace:select
  $ aio console:workspace:sel
  $ aio console:ws:select
  $ aio console:ws:sel
```

_See code: [src/commands/console/workspace/select.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.0.1/src/commands/console/workspace/select.js)_
<!-- commandsstop -->
