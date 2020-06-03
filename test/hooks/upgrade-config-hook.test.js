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

const hook = require('../../src/hooks/upgrade-config-hook')
// eslint-disable-next-line no-unused-vars
const config = require('@adobe/aio-lib-core-config')
const { CONFIG_KEYS } = require('../../src/config')
const OLD_CONSOLE_CONFIG_KEY = '$console'

const mockConfig = ({ oldConfig, newConfig } = {}) => {
  const mockStore = {}
  mockStore[OLD_CONSOLE_CONFIG_KEY] = oldConfig
  mockStore[CONFIG_KEYS.CONSOLE] = newConfig

  config.get.mockImplementation(key => {
    return mockStore[key]
  })

  config.delete.mockImplementation(key => {
    delete mockStore[key]
  })

  config.set.mockImplementation((key, value) => {
    mockStore[key] = value
  })
}

afterEach(() => {
  jest.clearAllMocks()
})

test('should export a function', () => {
  expect(typeof hook).toBe('function')
})

// eslint-disable-next-line jest/expect-expect
test('oldConfig: does not exist, newConfig: does not exist. (do nothing)', () => {
  mockConfig()
  return hook().then(() => {
    expect(config.get(OLD_CONSOLE_CONFIG_KEY)).toBeUndefined()
    expect(config.get(CONFIG_KEYS.CONSOLE)).toBeUndefined()
  })
})

// eslint-disable-next-line jest/expect-expect
test('oldConfig: does not exist, newConfig: exists. (do nothing)', () => {
  const newConfig = { foo: 'bar' }
  mockConfig({ newConfig })
  return hook().then(() => {
    expect(config.get(OLD_CONSOLE_CONFIG_KEY)).toBeUndefined()
    expect(config.get(CONFIG_KEYS.CONSOLE)).toEqual(newConfig)
  })
})

// eslint-disable-next-line jest/expect-expect
test('oldConfig: exists, newConfig: does not exist. (migrate to new, delete old)', () => {
  const oldConfig = { foo: 'bar' }
  mockConfig({ oldConfig })
  return hook().then(() => {
    expect(config.get(OLD_CONSOLE_CONFIG_KEY)).toBeUndefined()
    expect(config.get(CONFIG_KEYS.CONSOLE)).toEqual(oldConfig)
  })
})

// eslint-disable-next-line jest/expect-expect
test('oldConfig: exists, newConfig: exists (do nothing)', () => {
  const oldConfig = { foo: 'bar' }
  const newConfig = { baz: 'faz' }
  mockConfig({ oldConfig, newConfig })
  return hook().then(() => {
    expect(config.get(OLD_CONSOLE_CONFIG_KEY)).toEqual(oldConfig)
    expect(config.get(CONFIG_KEYS.CONSOLE)).toEqual(newConfig)
  })
})
