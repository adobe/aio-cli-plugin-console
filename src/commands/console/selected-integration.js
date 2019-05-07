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

const { Command, flags } = require('@oclif/command')
const { accessToken: getAccessToken } = require('@adobe/aio-cli-plugin-jwt-auth')
const { getIntegration, getConfig, getApiKey } = require('../../console-helpers')
const util = require('util')

// simplified to include only id+orgId, and name. Formatted for output.
async function _selectedIntegration (namespace, passphrase) {
  const apiKey = await getApiKey()
  const accessToken = await getAccessToken(passphrase)
  const integration = await getIntegration(namespace, accessToken, apiKey)
  return integration
}

class SelectedIntegrationCommand extends Command {
  async run () {
    const { flags } = this.parse(SelectedIntegrationCommand)
    let result

    const currentConfig = getConfig()
    if (!currentConfig['namespace']) {
      this.error('No integration is selected')
    }

    this.log(`----`)
    this.log(`APIHOST=${currentConfig['apihost']}`)
    this.log(`NAMESPACE=${currentConfig['namespace']}`)
    this.log(`AUTH=${currentConfig['auth']}`)
    this.log(`----`)

    try {
      result = await this.selectedIntegration(currentConfig['namespace'], flags.passphrase)
      this.log(util.inspect(result, { colors: true, maxArrayLength: null, breakLength: 75, depth: 50 }))
    } catch (error) {
      this.error(error.message)
    }

    return result
  }

  async selectedIntegration (namespace, passphrase) {
    return _selectedIntegration(namespace, passphrase)
  }
}

SelectedIntegrationCommand.description = 'lists the selected integration for use with Adobe I/O Runtime serverless functions'

SelectedIntegrationCommand.flags = {
  passphrase: flags.string({ char: 'p', description: 'the passphrase for the private-key', default: null })
}

SelectedIntegrationCommand.aliases = [
  'console:selected',
  'console:current'
]

module.exports = SelectedIntegrationCommand
