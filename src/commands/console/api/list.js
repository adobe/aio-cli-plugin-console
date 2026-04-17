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
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:api:list', { provider: 'debug' })

class ListCommand extends ConsoleCommand {
  async run () {
    const { flags } = await this.parse(ListCommand)

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
          const hasProfiles = Boolean(service.properties && service.properties.licenseConfigs && service.properties.licenseConfigs.length > 0)
          this.log(`  ${service.code}`)
          this.log(`    Name: ${service.name}`)
          if (hasProfiles) {
            this.log('    Requires product profile: yes')
          }
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

ListCommand.description = 'List API services available to the Organization'

ListCommand.flags = {
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

ListCommand.aliases = [
  'console:api:ls'
]

module.exports = ListCommand
