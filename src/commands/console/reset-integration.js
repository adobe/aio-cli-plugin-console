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

const { Command } = require('@oclif/command')
const { accessToken: getAccessToken } = require('@adobe/aio-cli-plugin-jwt-auth')
const { responseInterceptor, fetchWrapper, getNamespaceUrl, getApiKey, getIMSOrgId } = require('../../console-helpers')
const debug = require('debug')('aio-cli-plugin-console:reset-integration')

async function _resetIntegration (integrationId, passphrase) {
  if (!integrationId) {
    return Promise.reject(new Error('missing expected integration identifier.'))
  }

  const keys = integrationId.split('_')
  if (keys.length < 2) {
    return Promise.reject(new Error('integration identifier does not appear to be valid.'))
  }
  let namespaceUrl = await getNamespaceUrl()
  const FORWARD_SLASH = '/'
  // ensure namespaceUrl ends with '/'
  namespaceUrl += namespaceUrl.endsWith(FORWARD_SLASH) ? '' : FORWARD_SLASH
  const tempUrl = `${namespaceUrl}${keys.join(FORWARD_SLASH)}/reset`
  const accessToken = await getAccessToken(passphrase)
  const apiKey = await getApiKey()
  const imsOrgId = await getIMSOrgId()

  const options = {
    method: 'post',
    headers: {
      'X-Api-Key': apiKey,
      'x-ims-org-id': imsOrgId,
      Authorization: `Bearer ${accessToken}`,
      accept: 'application/json'
    }
  }

  return fetchWrapper(tempUrl, options).then((res) => {
    responseInterceptor(res)
    if (res.ok) return res.json()
    else throw new Error(`Cannot retrieve integration: ${tempUrl} (${res.status} ${res.statusText})`)
  })
}

class ResetIntegrationCommand extends Command {
  async run () {
    const { args } = this.parse(ResetIntegrationCommand)
    const { flags } = this.parse(ResetIntegrationCommand)
    let result

    try {
      result = await this.resetIntegration(args.integration_Id, flags.passphrase, flags.overwrite)
    } catch (error) {
      debug(error)
      this.error(error.message)
    }
    return result
  }

  async resetIntegration (integrationId, passphrase, overwrite) {
    return _resetIntegration(integrationId, passphrase, overwrite)
  }
}

ResetIntegrationCommand.args = [
  { name: 'integration_Id' }
]

ResetIntegrationCommand.flags = {}

ResetIntegrationCommand.description = `resets an integration's .wskprops auth hash.
after running this command all clients will need to run \`console:select-integration\` 
to get a new auth hash in their .wskprops file
`

ResetIntegrationCommand.aliases = [
  'console:reset'
]

module.exports = ResetIntegrationCommand
