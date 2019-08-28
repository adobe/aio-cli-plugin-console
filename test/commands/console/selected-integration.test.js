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

const helpers = require('../../../src/console-helpers')
helpers.getConfig = jest.fn(() => { return { namespace: '12_5' } })

const Command = require('../../../src/commands/console/selected-integration')

jest.mock('node-fetch', () => jest.fn().mockImplementationOnce(() => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 0 })
  })
})
  .mockImplementationOnce(() => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(
        { orgId: 0, id: 3, name: 'C' }
      )
    })
  }))
const config = require('@adobe/aio-cna-core-config')

jest.mock('@adobe/aio-cli-plugin-jwt-auth', () => {
  return {
    accessToken: () => {
      return Promise.resolve('fake-token')
    }
  }
})

test('selected-integrations - missing config', async () => {
  expect.assertions(2)

  const runResult = Command.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt-auth'))
})

test('selected-integrations - mock success', async () => {
  config.get.mockImplementation(() => {
    return {
      client_id: '1234',
      console_get_orgs_url: '...',
      namespace: '0_1'
    }
  })

  jest.mock('node-fetch', () => jest.fn().mockImplementation(() => null))

  const runResult = Command.run([])
  await expect(runResult).resolves.toEqual({ id: 0 })
})

test('selected-integrations - mock failure', async () => {
  helpers.getConfig.mockImplementation(() => { return {} })
  jest.mock('node-fetch', () => jest.fn().mockImplementation(() => null))

  const runResult = Command.run([])
  await expect(runResult).rejects.toEqual(new Error('No integration is selected'))
})

describe('basic command properties', () => {
  test('has a description', () => {
    expect(Command.description).toBeDefined()
  })

  test('has aliases', () => {
    expect(Command.aliases).toBeDefined()
  })

  test('has flags', () => {
    expect(Command.flags).toBeDefined()
  })
})
