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
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:org:select', { provider: 'debug' })
const { cli } = require('cli-ux')

const ConsoleCommand = require('../index')

class SelectCommand extends ConsoleCommand {
  async run () {
    const { args } = this.parse(SelectCommand)

    await this.initSdk()

    aioConsoleLogger.debug('Select Console Orgs')

    cli.action.start(`Retrieving the Organization with id: ${args.orgId}`)
    const [org] = await this.getConsoleOrgs(args.orgId)
    if (!org) {
      throw new Error('Invalid OrgId')
    }
    cli.action.stop()

    try {
      aioConsoleLogger.debug('Setting console Org')

      this.setConfig('org', org)

      this.log(`Org selected ${org.name}`)

      this.printConsoleConfig()

      return org
    } catch (err) {
      aioConsoleLogger.error(err)
      this.error('Failed to select Org')
    } finally {
      cli.action.stop()
    }
  }
}

SelectCommand.description = 'Select an Organization'

SelectCommand.args = [
  {
    name: 'orgId',
    required: true,
    description: 'Adobe I/O Org Id'
  }
]

SelectCommand.aliases = [
  'console:org:select',
  'console:org:sel'
]

module.exports = SelectCommand
