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
const config = require('@adobe/aio-lib-core-config')
const fs = require('fs')
const { accessToken: getAccessToken } = require('@adobe/aio-cli-plugin-jwt-auth')
const { consumeResponseJson, fetchWrapper, getNamespaceUrl, getApiKey, getWskPropsFilePath, getIMSOrgId } = require('../../console-helpers')
const debug = require('debug')('aio-cli-plugin-console:select-integration')
const { confirm } = require('cli-ux').cli

async function _selectIntegration (integrationId, passphrase, force, dest) {
  debug('_selectIntegration integrationId', integrationId)

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
  const tempUrl = `${namespaceUrl}${keys.join(FORWARD_SLASH)}`
  const accessToken = await getAccessToken(passphrase)
  const apiKey = await getApiKey()
  const imsOrgId = await getIMSOrgId()

  const options = {
    headers: {
      'X-Api-Key': apiKey,
      'x-ims-org-id': imsOrgId,
      Authorization: `Bearer ${accessToken}`,
      accept: 'application/json'
    }
  }

  debug('calling with options:', options)

  const res = await fetchWrapper(tempUrl, options)
  let result

  if (res.ok) {
    result = await consumeResponseJson(res)
  } else {
    throw new Error(`Cannot retrieve integration: ${tempUrl} (${res.status} ${res.statusText})`)
  }

  if (dest === 'local' || dest === 'global') {
    config.set('runtime', {
      apihost: 'https://adobeioruntime.net',
      namespace: result.name,
      auth: result.auth
    }, dest === 'local')
  } else {
    const wskProps = `APIHOST=https://adobeioruntime.net
NAMESPACE=${result.name}
AUTH=${result.auth}`

    const filePath = getWskPropsFilePath()

    if (fs.existsSync(filePath) && !force) {
      const confirmed = await confirm(`The OpenWhisk properties file '${filePath}' already exists. Do you want to overwrite it`)
      if (!confirmed) return
    }

    fs.writeFileSync(filePath, wskProps)
  }

  return result
}

class SelectIntegrationCommand extends Command {
  async run () {
    const { args } = this.parse(SelectIntegrationCommand)
    const { flags } = this.parse(SelectIntegrationCommand)
    let result

    let dest = 'wskprops'
    if (flags.local) dest = 'local'
    else if (flags.global) dest = 'global'

    try {
      result = await this.selectIntegration(args.integration_Id, flags.passphrase, flags.force, dest)
    } catch (error) {
      debug(error)
      this.error(error.message)
    }
    return result
  }

  async selectIntegration (integrationId, passphrase, force, dest) {
    return _selectIntegration(integrationId, passphrase, force, dest)
  }
}

SelectIntegrationCommand.args = [
  { name: 'integration_Id' }
]

SelectIntegrationCommand.flags = {
  passphrase: flags.string({ char: 'p', description: 'the passphrase for the private-key', default: null }),
  force: flags.boolean({ char: 'f', description: 'do not prompt if the .wskprops file exists', default: false }),
  local: flags.boolean({ char: 'l', description: 'save selected integration to local config', exclusive: ['global', 'wskprops'] }),
  global: flags.boolean({ char: 'g', description: 'save selected integration to global config', exclusive: ['local', 'wskprops'] }),
  wskprops: flags.boolean({ char: 'w', description: 'save selected integration to .wskprops file (default)', exclusive: ['global', 'local'] })
}

SelectIntegrationCommand.description = `selects an integration and writes the .wskprops file to the local machine
Run 'console:ls' to get a list of integrations to select from.
The .wskprops file will be written to your home folder, and you will be prompted whether you want to overwrite an existing file.
`

SelectIntegrationCommand.aliases = [
  'console:sel',
  'console:select'
]

module.exports = SelectIntegrationCommand
