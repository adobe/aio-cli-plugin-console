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

let helpers = require('../../../src/console-helpers')
helpers.getOrgs = jest.fn(() => Promise.resolve([{ id: 0 }]))
helpers.getIntegrations = jest.fn()
helpers.getIntegrations.mockImplementation(() => Promise.resolve({ page: 1,
  pages: 2,
  total: 3,
  content: [{ orgId: 0, id: 3, name: 'A', status: 'ENABLED' },
    { orgId: 0, id: 2, name: 'B', status: 'ENABLED' },
    { orgId: 0, id: 1, name: 'C', status: 'ENABLED' }]
}))

const ListIntegrationsCommand = require('../../../src/commands/console/list-integrations')
const config = require('@adobe/aio-cna-core-config')

afterEach(() => {
  jest.clearAllMocks()
})

jest.mock('@adobe/aio-cli-plugin-jwt-auth', () => {
  return {
    accessToken: () => {
      return Promise.resolve('fake-token')
    }
  }
})

test('list-integrations - missing config', async () => {
  expect.assertions(2)

  let runResult = ListIntegrationsCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt-auth'))
})

test('list-integrations - mock success', async () => {
  config.get.mockImplementation(() => {
    return {
      client_id: '1234',
      console_get_orgs_url: '...',
      namespace: '0_1'
    }
  })

  expect.assertions(1)

  let runResult = ListIntegrationsCommand.run([])
  return expect(runResult).resolves.toEqual([{ 'id': 1, 'name': 'C', 'namespace': '0_1', 'orgId': 0, 'selected': true, 'status': 'ENABLED' }, { 'id': 1, 'name': 'C', 'namespace': '0_1', 'orgId': 0, 'selected': true, 'status': 'ENABLED' }, { 'id': 2, 'name': 'B', 'namespace': '0_2', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }, { 'id': 2, 'name': 'B', 'namespace': '0_2', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }, { 'id': 3, 'name': 'A', 'namespace': '0_3', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }, { 'id': 3, 'name': 'A', 'namespace': '0_3', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }])
})

test('list-integrations - mock success sort by name', async () => {
  config.get.mockImplementation(() => {
    return {
      client_id: '1234',
      console_get_orgs_url: '...',
      namespace: '0_1'
    }
  })

  jest.mock('node-fetch', () => jest.fn().mockImplementation(() => null))
  expect.assertions(1)

  let runResult = ListIntegrationsCommand.run(['--name'])
  return expect(runResult).resolves.toEqual([{ 'id': 3, 'name': 'A', 'namespace': '0_3', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }, { 'id': 3, 'name': 'A', 'namespace': '0_3', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }, { 'id': 2, 'name': 'B', 'namespace': '0_2', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }, { 'id': 2, 'name': 'B', 'namespace': '0_2', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }, { 'id': 1, 'name': 'C', 'namespace': '0_1', 'orgId': 0, 'selected': true, 'status': 'ENABLED' }, { 'id': 1, 'name': 'C', 'namespace': '0_1', 'orgId': 0, 'selected': true, 'status': 'ENABLED' }])
})

test('list-integrations - mock success, multiple pages', async () => {
  config.get.mockImplementation(() => {
    return {
      client_id: '1234',
      console_get_orgs_url: '...',
      namespace: '0_1'
    }
  })

  expect.assertions(1)

  let runResult = ListIntegrationsCommand.run([])
  return expect(runResult).resolves.toEqual([{ 'id': 1, 'name': 'C', 'namespace': '0_1', 'orgId': 0, 'selected': true, 'status': 'ENABLED' }, { 'id': 1, 'name': 'C', 'namespace': '0_1', 'orgId': 0, 'selected': true, 'status': 'ENABLED' }, { 'id': 2, 'name': 'B', 'namespace': '0_2', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }, { 'id': 2, 'name': 'B', 'namespace': '0_2', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }, { 'id': 3, 'name': 'A', 'namespace': '0_3', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }, { 'id': 3, 'name': 'A', 'namespace': '0_3', 'orgId': 0, 'selected': false, 'status': 'ENABLED' }])
})

test('ls missing client_id', async () => {
  config.get.mockImplementation(() => {
    return { }
  })

  expect.assertions(2)

  let runResult = ListIntegrationsCommand.run([])
  await expect(runResult).rejects.toEqual(new Error('missing config data: client_id'))

  runResult = new ListIntegrationsCommand().listIntegrations()
  await expect(runResult).rejects.toEqual(new Error('missing config data: client_id'))
})

describe('basic command properties', () => {
  test('has a description', () => {
    expect(ListIntegrationsCommand.description).toBeDefined()
  })

  test('has aliases', () => {
    expect(ListIntegrationsCommand.aliases).toBeDefined()
  })

  test('has flags', () => {
    expect(ListIntegrationsCommand.flags).toBeDefined()
  })
})
