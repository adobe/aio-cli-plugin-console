/*
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const BaseIndexCommand = require('@adobe/oclif-base-index-command')

class ConsoleCommand extends BaseIndexCommand {
}

// this is set in package.json, see https://github.com/oclif/oclif/issues/120
// if not set it will get the first (alphabetical) topic's help description
ConsoleCommand.description = 'List or select console integrations for the Adobe I/O Runtime'

ConsoleCommand.examples = [
  '$ aio console:list-integrations',
  '$ aio console:ls',
  '$ aio console list-integrations',
  '$ aio console:select-integration INTEGRATION_ID',
  '$ aio console:sel INTEGRATION_ID',
  '$ aio console select-integration INTEGRATION_ID',
  '$ aio console:reset-integration INTEGRATION_ID',
  '$ aio console:reset INTEGRATION_ID',
  '$ aio console reset-integration INTEGRATION_ID',
]

module.exports = ConsoleCommand
