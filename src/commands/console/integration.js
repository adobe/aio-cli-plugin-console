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
const { getIntegration, getApiKey } = require('../../console-helpers')
const util = require('util')
const debug = require('debug')('aio-cli-plugin-console:integration')

// simplified to include only id+orgId, and name. Formatted for output.
async function _getIntegration (namespace, passphrase) {
  const apiKey = await getApiKey()
  const accessToken = await getAccessToken(passphrase)
  const integration = await getIntegration(namespace, accessToken, apiKey)
  return integration
}

class IntegrationCommand extends Command {
  async run () {
    const { args, flags } = this.parse(IntegrationCommand)
    let result

    try {
      result = await this.integration(args.namespace, flags.passphrase)
      this.log(util.inspect(result, { colors: true, maxArrayLength: null, breakLength: 75, depth: 50 }))
    } catch (error) {
      debug(error)
      this.error(error.message)
    }

    return result
  }

  async integration (namespace, passphrase) {
    return _getIntegration(namespace, passphrase)
  }
}

IntegrationCommand.description = 'Views an integration for use with Adobe I/O Runtime serverless functions'

IntegrationCommand.flags = {
  passphrase: flags.string({ char: 'p', description: 'the passphrase for the private-key', default: null })
}

IntegrationCommand.args = [
  {
    name: 'namespace',
    required: true,
    description: 'namespace of an integration'
  }
]

IntegrationCommand.aliases = [
  'console:get',
  'console:int'
]

module.exports = IntegrationCommand
