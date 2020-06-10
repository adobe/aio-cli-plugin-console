/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:project:select', { provider: 'debug' })
const { cli } = require('cli-ux')
const { flags } = require('@oclif/command')
const { CONFIG_KEYS } = require('../../../config')

const ConsoleCommand = require('../index')

class SelectCommand extends ConsoleCommand {
  async run () {
    const { args, flags } = this.parse(SelectCommand)

    const orgId = flags.orgId || this.getConfig(`${CONFIG_KEYS.ORG}.id`)

    if (!orgId) {
      this.log('You have not selected an Organization. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    await this.initSdk()

    try {
      aioConsoleLogger.debug('Select Console Project')

      cli.action.start(`Retrieving the Project with id: ${args.projectId}`)
      const project = await this.getConsoleOrgProject(orgId, args.projectId)
      cli.action.stop()

      aioConsoleLogger.debug('Selecting Console Project')

      this.setConfig(CONFIG_KEYS.PROJECT, project)
      this.clearConfigKey(CONFIG_KEYS.WORKSPACE)

      this.log(`Project selected ${project.name}`)

      this.printConsoleConfig()
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      cli.action.stop()
    }
  }
}

SelectCommand.description = 'Select a Project for the selected Organization'

SelectCommand.args = [
  {
    name: 'projectId',
    required: true,
    description: 'Adobe I/O Project Id'
  }
]

SelectCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: flags.string({
    description: 'OrgID of the project to select'
  })
}

SelectCommand.aliases = [
  'console:project:sel'
]

module.exports = SelectCommand
