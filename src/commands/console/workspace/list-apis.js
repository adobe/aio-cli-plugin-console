/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const { Flags } = require('@oclif/core')
const ConsoleCommand = require('../index')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:workspace:list-apis', { provider: 'debug' })

class ListApisCommand extends ConsoleCommand {
  async run () {
    const { flags } = await this.parse(ListApisCommand)

    const orgId = flags.orgId || this.getConfig('org.id')
    if (!orgId) {
      this.log('You have not selected an Organization. Please select one first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    await this.initSdk()

    try {
      const enabledServices = await this.consoleCLI.getEnabledServicesForOrg(orgId)
      aioConsoleLogger.debug(`Enabled services: ${JSON.stringify(enabledServices.map(s => s.code))}`)

      if (flags.json) {
        this.printJson(enabledServices)
      } else if (flags.yml) {
        this.printYaml(enabledServices)
      } else {
        if (enabledServices.length === 0) {
          this.log('No enabled API services found for this Organization.')
          return []
        }
        this.log(`Enabled API services for the Organization (${enabledServices.length}):`)
        this.log('')
        for (const service of enabledServices) {
          this.log(`  ${service.code}`)
          this.log(`    Name: ${service.name}`)
          this.log('')
        }
      }

      return enabledServices
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }
}

ListApisCommand.description = 'List available API services for the Organization'

ListApisCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: Flags.string({
    description: 'Organization id'
  }),
  json: Flags.boolean({
    description: 'Output json',
    char: 'j',
    exclusive: ['yml']
  }),
  yml: Flags.boolean({
    description: 'Output yml',
    char: 'y',
    exclusive: ['json']
  })
}

ListApisCommand.aliases = [
  'console:ws:list-apis'
]

module.exports = ListApisCommand
