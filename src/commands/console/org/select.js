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
const { Args } = require('@oclif/core')
const { CONFIG_KEYS } = require('../../../config')

const ConsoleCommand = require('../index')

class SelectCommand extends ConsoleCommand {
  async run () {
    const { args } = await this.parse(SelectCommand)

    await this.initSdk()

    try {
      const org = await this.selectOrgInteractive(args.orgCode)

      aioConsoleLogger.debug('Setting console Org in config')

      this.setConfig(CONFIG_KEYS.ORG, org)
      this.clearConfig(CONFIG_KEYS.PROJECT)
      this.clearConfig(CONFIG_KEYS.WORKSPACE)

      this.log(`Org selected ${org.name}`)

      this.printConsoleConfig()
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }

  async selectOrgInteractive (preSelectedOrgIdOrCode) {
    const orgs = await this.consoleCLI.getOrganizations()
    const org = await this.consoleCLI.promptForSelectOrganization(
      orgs,
      { orgId: preSelectedOrgIdOrCode, orgCode: preSelectedOrgIdOrCode }
    )
    // Omit props
    return { id: org.id, code: org.code, name: org.name }
  }
}

SelectCommand.description = 'Select an Organization'

SelectCommand.args = {
  orgCode: Args.string({
    description: 'Adobe Developer Console Org code',
    required: false
  })
}

SelectCommand.aliases = [
  'console:org:sel'
]

module.exports = SelectCommand
