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

const ListIntegrationsCommand = require('../../../src/commands/console/list-integrations')
jest.mock('request-promise-native')

jest.setTimeout(10000)

let mockStore = {
  // 'jwt-auth': JSON.stringify({
  // }),
}

jest.mock('conf', () => {
  return function () { // constructor
    // set properties and functions for object
    // this is how you can get the call stats on the mock instance,
    // see https://github.com/facebook/jest/issues/2982
    Object.defineProperty(this, 'store',
      {
        get: jest.fn(() => mockStore),
      })

    this.get = jest.fn(k => mockStore[k])
    this.set = jest.fn()
    this.delete = jest.fn()
    this.clear = jest.fn()
  }
})

jest.mock('@adobe/aio-cli-plugin-jwt-auth', () => {
  return {
    accessToken: () => {
      return Promise.resolve('fake-token')
    },
  }
})

beforeEach(() => {
  mockStore = {}
})

test('list-integrations - missing config', async () => {
  expect.assertions(2)

  let runResult = ListIntegrationsCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt-auth'))
})

test('list-integrations - mock success', async () => {
  mockStore = {
    'jwt-auth': JSON.stringify({
      client_id: '1234',
      console_get_orgs_url: '...',
    }),
  }

  let rp = require('request-promise-native')
  rp.mockImplementationOnce(() => {
    // first call is to getOrgs ...
    return Promise.resolve([{id: 0}])
  })
  .mockImplementationOnce(() => {
    // second call is to getIntegrations within org
    return Promise.resolve({page: 1,
      pages: 2,
      total: 15,
      content: [{orgId: 0, id: 1, name: 'A'},
        {orgId: 0, id: 2, name: 'B'},
        {orgId: 0, id: 3, name: 'C'}],
    })
  })

  expect.assertions(2)

  let runResult = ListIntegrationsCommand.run(['--page=1', '--pageSize=10'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual('Success: Page 2 of 2, Showing 3 results of 15 total.\n0_1 : A\n0_2 : B\n0_3 : C')
})

test('ls missing client_id', async () => {
  mockStore = {
    'jwt-auth': JSON.stringify({
      not_client_id: '1234',
    }),
  }

  expect.assertions(4)

  let runResult = ListIntegrationsCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: client_id'))

  // coverage
  runResult = new ListIntegrationsCommand().listIntegrations()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: client_id'))
})
