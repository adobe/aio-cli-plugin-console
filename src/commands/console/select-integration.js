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

const {Command} = require('@oclif/command')
const rp = require('request-promise-native')
const dedent = require('dedent-js')
const fs = require('fs')
const {accessToken: getAccessToken} = require('@adobe/aio-cli-plugin-jwt-auth')
const {getNamespaceUrl, getApiKey, getWskPropsFilePath} = require('../../console-helpers')

async function _selectIntegration(integrationId) {
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
    const accessToken = await getAccessToken()
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
    fs.writeFileSync(filePath, wskProps)

    return result
  } catch (e) {
    return Promise.reject(e)
  }
}

class SelectIntegrationCommand extends Command {
  async run() {
    const {args} = this.parse(SelectIntegrationCommand)
    let result

    try {
      result = await this.selectIntegration(args.integration_Id)
    } catch (e) {
      this.error(e.message)
    }
    return result
  }

  async selectIntegration(integrationId) {
    return _selectIntegration(integrationId)
  }
}

SelectIntegrationCommand.args = [
  {name: 'integration_Id'},
]

SelectIntegrationCommand.description = `selects an integration and writes the .wskprops file to the local machine
Run 'console:ls' to get a list of integrations to select from.
The .wskprops file will be written to your home folder, and will overwrite the existing file.
`

SelectIntegrationCommand.aliases = [
  'console:sel',
]

module.exports = SelectIntegrationCommand
