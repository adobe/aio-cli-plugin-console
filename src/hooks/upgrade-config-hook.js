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

const config = require('@adobe/aio-lib-core-config')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:upgrade-config-hook', { provider: 'debug' })
const { CONFIG_KEYS } = require('../config')

const upgrade = async () => {
  aioConsoleLogger.debug('hook running.')

  const oldConfigKey = '$console'
  const newConfigKey = CONFIG_KEYS.CONSOLE

  const oldConfig = config.get(oldConfigKey)
  const newConfig = config.get(newConfigKey)

  if (oldConfig && !newConfig) {
    aioConsoleLogger.debug(`Migrating from '${oldConfigKey}' to '${newConfigKey}'.`)

    aioConsoleLogger.debug(`Writing to new config key '${newConfigKey}': ${JSON.stringify(oldConfig, null, 2)}`)
    config.set(newConfigKey, oldConfig)
    aioConsoleLogger.debug(`Deleting old config key '${oldConfigKey}'.`)
    config.delete(oldConfigKey)
  }
}

module.exports = upgrade
