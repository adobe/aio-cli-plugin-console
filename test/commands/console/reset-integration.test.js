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

const fs = require('fs')
const config = require('@adobe/aio-cna-core-config')
const ResetIntegrationCommand = require('../../../src/commands/console/reset-integration')

let mockResult
jest.mock('node-fetch', () => jest.fn().mockImplementation(() => mockResult))
const fetch = require('node-fetch')

beforeEach(() => {
  jest.clearAllMocks()
  mockResult = Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
})

jest.mock('@adobe/aio-cli-plugin-jwt-auth', () => {
  return {
    accessToken: () => {
      return Promise.resolve('fake-token')
    }
  }
})

test('reset-integration - no args', async () => {
  expect.assertions(2)

  const runResult = ResetIntegrationCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing expected integration identifier.'))
})

test('reset-integration - bad args', async () => {
  expect.assertions(2)

  const runResult = ResetIntegrationCommand.run(['7'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('integration identifier does not appear to be valid.'))
})

test('reset-integration - console_get_namespaces_url, does not end with forward slash', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => false)

  config.get.mockImplementation(() => {
    return { client_id: 1234, console_get_namespaces_url: 'http://foo.bar', jwt_payload: { iss: 'asd' } }
  })

  mockResult = Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ name: 'Basil', auth: '======' })
  })

  expect.assertions(2)

  const runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({ name: 'Basil', auth: '======' })
})

test('reset-integration - mock success', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get.mockImplementation(key => {
    return { client_id: 1234, console_get_namespaces_url: 'http://foo.bar/', jwt_payload: { iss: 'asd' } }
  })

  mockResult = Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ name: 'Basil', auth: '======' })
  })

  expect.assertions(3)

  const runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({ name: 'Basil', auth: '======' })
  expect(fetch).toHaveBeenCalledWith('http://foo.bar/5/5/reset', { headers: { Authorization: 'Bearer fake-token', 'X-Api-Key': 1234, accept: 'application/json', 'x-ims-org-id': 'asd' } })
})

test('reset-integration - config error', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get
    .mockImplementation(key => {
      return { not_client_id: '1234' }
    })

  expect.assertions(2)

  const runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: client_id'))
})

test('reset-integration - config error missing jwt_payload', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get
    .mockImplementation(key => {
      return { client_id: '1234' }
    })

  expect.assertions(2)

  const runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt_payload'))
})

test('reset-integration - config error missing jwt_payload pre-condition', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  const goodValue = { client_id: 1234 }
  // first mock is for getNamespaceUrl
  // second mock is for getAccessToken
  // third mock we want to fail so we can get full test coverage
  config.get
    .mockImplementationOnce(key => {
      return goodValue
    })
    .mockImplementationOnce(key => {
      return goodValue
    })
    .mockImplementationOnce(() => {})

  expect.assertions(2)

  const runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt-auth'))
})

test('reset-integration - config error missing jwt_payload.iss', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get
    .mockImplementation(key => {
      if (key === 'jwt-auth') {
        return { client_id: '1234', console_get_namespaces_url: 'http://foo.bar/', jwt_payload: {} }
      }
    })

  expect.assertions(2)

  const runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt_payload.iss'))
})

test('reset-integration - bad fetch', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get
    .mockImplementation(key => {
      if (key === 'jwt-auth') {
        return { client_id: '1234', console_get_namespaces_url: 'http://foo.bar/', jwt_payload: { iss: 'asd' } }
      }
    })

  expect.assertions(2)

  mockResult = Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' })

  const runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('Cannot retrieve integration: http://foo.bar/5/5/reset (404 Not Found)'))
})

describe('ResetIntegrationCommand : basic command properties', () => {
  test('has a description', () => {
    expect(ResetIntegrationCommand.description).toBeDefined()
  })

  test('has args', () => {
    expect(ResetIntegrationCommand.args).toBeDefined()
  })

  test('has aliases', () => {
    expect(ResetIntegrationCommand.aliases).toBeDefined()
  })

  test('has flags', () => {
    expect(ResetIntegrationCommand.flags).toBeDefined()
  })
})
