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

const ListIntegrationsCommand = require('./commands/console/list-integrations')
const SelectIntegrationCommand = require('./commands/console/select-integration')
const ConsoleCommand = require('./commands/console')

// The full process we intend to enable with this command is:
// 1. get an access token from jwt_auth command
// 2. get a list of orgs from console
// 3. get a list of integrations from the first org with type == entp
// 4. select an integration from the list
// 5. write a wskprops file based on selected integration details

module.exports = {
  index: ConsoleCommand,
  'list-integrations': new ListIntegrationsCommand().listIntegrations,
  'select-integration': new SelectIntegrationCommand().selectIntegration,
}
