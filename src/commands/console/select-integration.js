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

const {Command, flags} = require('@oclif/command')
const rp = require('request-promise-native')
const dedent = require('dedent-js')
const fs = require('fs')
const {accessToken: getAccessToken} = require('@adobe/aio-cli-plugin-jwt-auth')
const {getNamespaceUrl, getApiKey, getWskPropsFilePath} = require('../../console-helpers')
const {cli} = require('cli-ux')

async function _selectIntegration(integrationId, passphrase) {
  if (!integrationId) {
    return Promise.reject(new Error('missing expected integration identifier.'))
  }

  const keys = integrationId.split('_')
  if (keys.length < 2) {
    return Promise.reject(new Error('integration identifier does not appear to be valid.'))
  }

  try {
    let namespaceUrl = await getNamespaceUrl()
    const FORWARD_SLASH = '/'
    // ensure namespaceUrl ends with '/'
    namespaceUrl += namespaceUrl.endsWith(FORWARD_SLASH) ? '' : FORWARD_SLASH
    const tempUrl = `${namespaceUrl}${keys.join(FORWARD_SLASH)}`
    const accessToken = await getAccessToken(passphrase)
    const apiKey = await getApiKey()

    const options = {
      uri: tempUrl,
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        Authorization: `Bearer ${accessToken}`,
        accept: 'application/json',
      },
      json: true,
    }
    const result = await rp(options)

    const wskProps = dedent`
      APIHOST=https://runtime.adobe.io
      NAMESPACE=${result.name}
      AUTH=${result.auth}`

    const filePath = getWskPropsFilePath()

    let writeToFile = true
    let _confirm = async message => {
      try {
        let response = await cli.prompt(`${message} (y/n)`, {required: false, timeout: 20000, default: 'n'})
        if (['n', 'no'].includes(response)) return false
        if (['y', 'yes'].includes(response)) return true
        return _confirm(message)
      } catch (e) {
        return false
      }
    }

    if (fs.existsSync(filePath)) {
      writeToFile = await _confirm(`The OpenWhisk properties file '${filePath}' already exists. Do you want to overwrite it?`)
    }

    if (writeToFile) {
      fs.writeFileSync(filePath, wskProps)
    }

    return result
  } catch (e) {
    return Promise.reject(e)
  }
}

class SelectIntegrationCommand extends Command {
  async run() {
    const {args} = this.parse(SelectIntegrationCommand)
    const {flags} = this.parse(SelectIntegrationCommand)
    let result

    try {
      result = await this.selectIntegration(args.integration_Id, flags.passphrase)
    } catch (e) {
      this.error(e.message)
    }
    return result
  }

  async selectIntegration(integrationId, passphrase) {
    return _selectIntegration(integrationId, passphrase)
  }
}

SelectIntegrationCommand.args = [
  {name: 'integration_Id'},
]

SelectIntegrationCommand.flags = {
  passphrase: flags.string({char: 'p', description: 'the passphrase for the private-key'}),
}

SelectIntegrationCommand.description = `selects an integration and writes the .wskprops file to the local machine
Run 'console:ls' to get a list of integrations to select from.
The .wskprops file will be written to your home folder, and will overwrite the existing file.
`

SelectIntegrationCommand.aliases = [
  'console:sel',
]

module.exports = SelectIntegrationCommand
