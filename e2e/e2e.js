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

const execa = require('execa')
const { CONFIG_KEYS } = require('../src/config')
const fs = require('fs')
process.env.DEBUG = 'aio-cli-config*'
// set global config file
process.env.AIO_CONFIG_FILE = '.e2e-aio-config'

beforeEach(async () => {
  fs.writeFileSync('.e2e-aio-config', '')
})
afterAll(async () => {
  fs.unlinkSync('.e2e-aio-config')
})

describe('aio:where tests', () => {
  test('no org selected', async () => {
    await expect(execa('./bin/run', ['where'], { stderr: 'inherit' }))
      .resolves.toEqual(expect.objectContaining({ exitCode: 0 }))
  })

  test('an org is selected', async () => {
    fs.writeFileSync('.e2e-aio-config', JSON.stringify({ [CONFIG_KEYS.CONSOLE]: { org: { name: 'E2e Test Org' } } }))
    await expect(execa('./bin/run', ['where'], { stderr: 'inherit' }))
      .resolves.toEqual(expect.objectContaining({
        exitCode: 0,
        stdout: expect.stringContaining('1. Org: E2e Test Org')
      }))
  })
})
