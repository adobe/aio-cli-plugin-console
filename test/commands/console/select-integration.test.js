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
jest.mock('cli-ux')
const { cli } = require('cli-ux')
cli.confirm = jest.fn(() => true)
const SelectIntegrationCommand = require('../../../src/commands/console/select-integration')
const path = require('path')
let mockResult
jest.mock('node-fetch', () => jest.fn().mockImplementation(() => mockResult))
const fetch = require('node-fetch')

beforeEach(() => {
  jest.clearAllMocks()
  cli.confirm.mockImplementation(() => true)
  mockResult = Promise.resolve({
    ok: true,
    text: () => Promise.resolve('{}')
  })
})

jest.mock('@adobe/aio-cli-plugin-jwt-auth', () => {
  return {
    accessToken: () => {
      return Promise.resolve('fake-token')
    }
  }
})

afterAll(() => {
  jest.resetAllMocks()
})

test('select-integration - no args', async () => {
  expect.assertions(2)

  const runResult = SelectIntegrationCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing expected integration identifier.'))
})

test('select-integration - bad args', async () => {
  expect.assertions(2)

  const runResult = SelectIntegrationCommand.run(['7'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('integration identifier does not appear to be valid.'))
})

test('select-integration - console_get_namespaces_url, does not end with forward slash', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => false)

  config.get.mockImplementation(key => {
    return { client_id: 1234, console_get_namespaces_url: 'http://foo.bar', jwt_payload: { iss: 'asd' } }
  })

  mockResult = Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ name: 'Basil', auth: '======' }))
  })

  expect.assertions(2)

  const runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({ name: 'Basil', auth: '======' })
})

test('select-integration - mock success', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementation(() => true)

  config.get.mockImplementation(() => {
    return { client_id: 1234, console_get_namespaces_url: 'http://foo.bar/', jwt_payload: { iss: 'asd' } }
  })

  expect.assertions(4)
  mockResult = Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ name: 'Basil', auth: '======' }))
  })

  const runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({ name: 'Basil', auth: '======' })
  expect(cli.confirm).toHaveBeenCalledWith(`The OpenWhisk properties file '${path.resolve(require('os').homedir(), '.wskprops')}' already exists. Do you want to overwrite it`)
  expect(fetch).toHaveBeenCalledWith('http://foo.bar/5/5', { headers: { Authorization: 'Bearer fake-token', 'X-Api-Key': 1234, accept: 'application/json', 'x-ims-org-id': 'asd' } })
})

test('select-integration - write local', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get.mockImplementation(() => {
    return { client_id: 1234, console_get_namespaces_url: 'http://foo.bar/', jwt_payload: { iss: 'asd' } }
  })

  expect.assertions(4)
  mockResult = Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ name: 'Basil', auth: '======' }))
  })

  const runResult = SelectIntegrationCommand.run(['5_5', '--local'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({ name: 'Basil', auth: '======' })
  expect(config.set).toHaveBeenCalledWith('runtime', { apihost: 'https://adobeioruntime.net', auth: '======', namespace: 'Basil' }, true)
  expect(fetch).toHaveBeenCalledWith('http://foo.bar/5/5', { headers: { Authorization: 'Bearer fake-token', 'X-Api-Key': 1234, accept: 'application/json', 'x-ims-org-id': 'asd' } })
})

test('select-integration - write global', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get.mockImplementation(() => {
    return { client_id: 1234, console_get_namespaces_url: 'http://foo.bar/', jwt_payload: { iss: 'asd' } }
  })

  expect.assertions(4)
  mockResult = Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ name: 'Basil', auth: '======' }))
  })

  const runResult = SelectIntegrationCommand.run(['5_5', '--global'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({ name: 'Basil', auth: '======' })
  expect(config.set).toHaveBeenCalledWith('runtime', { apihost: 'https://adobeioruntime.net', auth: '======', namespace: 'Basil' }, false)
  expect(fetch).toHaveBeenCalledWith('http://foo.bar/5/5', { headers: { Authorization: 'Bearer fake-token', 'X-Api-Key': 1234, accept: 'application/json', 'x-ims-org-id': 'asd' } })
})

test('select-integration - config error', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get
    .mockImplementation(key => {
      return { not_client_id: '1234' }
    })

  expect.assertions(2)

  const runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: client_id'))
})

test('select-integration - config error missing jwt_payload', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get
    .mockImplementation(() => {
      return { client_id: '1234', console_get_namespaces_url: 'http://foo.bar/' }
    })

  expect.assertions(2)

  const runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt_payload'))
})

test('select-integration - config error missing jwt_payload pre-condition', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  const goodValue = { client_id: 1234, console_get_namespaces_url: 'http://foo.bar/' }

  config.get
    .mockImplementationOnce(() => {
      return goodValue
    })
    .mockImplementationOnce(() => {
      return goodValue
    })
    .mockImplementationOnce(() => {})

  expect.assertions(2)

  const runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt-auth'))
})

test('select-integration - config error missing jwt_payload.iss', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get
    .mockImplementation(key => {
      return { client_id: '1234', console_get_namespaces_url: 'http://foo.bar/', jwt_payload: {} }
    })

  expect.assertions(2)

  const runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt_payload.iss'))
})

test('select-integration - bad fetch', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get
    .mockImplementation(key => {
      return { client_id: 1234, console_get_namespaces_url: 'http://foo.bar/', jwt_payload: { iss: 'asd' } }
    })

  expect.assertions(2)

  mockResult = Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' })

  const runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('Cannot retrieve integration: http://foo.bar/5/5 (404 Not Found)'))
})

test('select-integration - mock success and overwrite .wskprops', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  config.get
    .mockImplementation(() => {
      return { client_id: 1234, console_get_namespaces_url: 'http://foo.bar/', jwt_payload: { iss: 'asd' } }
    })

  mockResult = Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ name: 'Basil', auth: '======' }))
  })

  expect.assertions(2)

  const runResult = SelectIntegrationCommand.run(['5_5', '--force'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({ name: 'Basil', auth: '======' })
})

test('select-integration - mock success and dont overwrite .wskprops', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => false)
  cli.confirm.mockImplementation(() => false)

  config.get
    .mockImplementation(() => {
      return { client_id: 1234, console_get_namespaces_url: 'http://foo.bar/', jwt_payload: { iss: 'asd' } }
    })

  mockResult = Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ name: 'Basil', auth: '======' }))
  })

  expect.assertions(3)

  const runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual(undefined)
  expect(fs.writeFileSync).not.toHaveBeenCalled()
})

test('select-integration - mock .wskprops does not exist', async () => {
  jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => null)
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => false)

  config.get
    .mockImplementation(key => {
      return { client_id: 1234, console_get_namespaces_url: 'http://foo.bar/', jwt_payload: { iss: 'asd' } }
    })

  mockResult = Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ name: 'Basil', auth: '======' }))
  })

  expect.assertions(2)

  const runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({ name: 'Basil', auth: '======' })
})

describe('SelectIntegrationCommand : basic command properties', () => {
  test('has a description', () => {
    expect(SelectIntegrationCommand.description).toBeDefined()
  })

  test('has aliases', () => {
    expect(SelectIntegrationCommand.aliases).toBeDefined()
  })

  test('has args', () => {
    expect(SelectIntegrationCommand.args).toBeDefined()
  })

  test('has flags', () => {
    expect(SelectIntegrationCommand.flags).toBeDefined()
  })
})
