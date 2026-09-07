# DHIS2 Dashboard Index Plugin

## Description

This plugin allows generating an index of the components of a dashboard as a HTML list with clickable entries that will scroll to the element.
The plugins are not designed to interact with its parent App (Dashboard in this case), so there is no "native" way of doing this.

To archive this the plugin uses its dashboard DOM to match the dashboard `dashboardItems` by id via the [data-test="dashboarditem-{ID}"] property.

Depending of the `dashboardItem` type the plugin uses its `displayName` or, in the case of text widgets, it looks for the first instance of a markdown Header 1 text string (`# Header text`).
If no Header 1 is found it uses a generic "Text Element" as the text widget is not considered as a section separator.
The spacer widget is stored in API with a text type, the app ignores them. It also ignores widgets of type App (plugins).

The index entries are sorted by the widget position on the Dashboard (`dashboardItems` have a `x` and `y` properties with this information).

### Configuration

The plugin has a configuration page accessible while editing the Dashboard. It shows a checkbox per indexable item type:

- Visualizations, Event visualizations, Event charts, Maps, Event reports, Reports, Resources, Messages
- Text (with markdown header) - Datastore name: `TEXT_MARKDOWN` - enabled by default
- Text (plain, no header) - Datastore name: `TEXT_PLAIN`

At least one item type must always stay enabled; the last remaining checked type cannot be unchecked, so the index doesn't end up empty through the config page.

This per-item selection is persisted as a saved object in the dataStore, keyed by the dashboard item's id, so each instance of the plugin on a dashboard has its own independent configuration.

For dashboard items that don't have a saved configuration yet, the plugin falls back to an instance-wide default, configurable via **Datastore Management**:

- Namespace: `dashboard-index-plugin`
- Key: `settings`
- Field: `defaultEnabledItemTypes` (created automatically if key `settings` is missing, pre-filled with `["TEXT_MARKDOWN"]`)
- Possible Values: `TEXT_MARKDOWN`, `TEXT_PLAIN`, `VISUALIZATION`, `EVENT_VISUALIZATION`, `EVENT_CHART`, `MAP`, `EVENT_REPORT`, `REPORTS`, `RESOURCES`, `MESSAGES`

If either the per-item saved config or the instance-wide default is ever manually edited into an invalid shape (e.g. an empty list), the plugin ignores the invalid value and falls back to `["TEXT_MARKDOWN"]` instead of showing an empty index.

Localization can be provided via the `@dhis2/d2-i18n` library.

## Prerequisites

- Node.js >= v24
- Yarn 4

## Setup

### Build the ZIP

```sh
nvm use
yarn install
yarn build
```

#### Install in DHIS2

1. Build the plugin (`yarn build`) and upload `./build/bundle/Dashboard Index-VERSION.zip` to your DHIS2 instance (App Management -> Manual Install).
2. Open a Dashboard (or create one) and click **Edit**.
3. Click **Search for items to add to this dashboard**, write **Dashboard Index** and select it in the **Apps** section.
4. Move the Plugin to the desired position in the Dashboard.
5. Configure which item types are indexed (optional, per dashboard):
    - While editing the dashboard, the plugin shows its configuration page.
    - Check/uncheck the item types that should be listed (at least one must stay checked).

6. Click **Save changes**. The plugin now shows the index of that dashboard's items.

7. Configure the instance-wide default (optional):
    - Open **Datastore Management**.
    - Go to namespace `dashboard-index-plugin`, key `settings`.
    - Edit `defaultEnabledItemTypes` to change what dashboard items index by default when they don't have their own saved configuration yet, e.g.:
        ```json
        {
            "defaultEnabledItemTypes": ["TEXT_MARKDOWN", "VISUALIZATION"]
        }
        ```
    - Optionally, you can limit the sharing settings of the namespace for "All users" to read only, to avoid unintended users changing the instance-wide default.

8. Add plugin authority.
    - DHIS2 users don't have access to most apps or plugins by default. To allow the plugin to work with all the intended users either:
        - Create a new role and add it to the users
        - Use an existing role for accessing Dashboards or similar purpose and add it there

        The plugin authority is: "Dashboard Index app".

## Development

Use: `D2_PASSWORD={password} yarn deploy {instance_url} -u {user}` to build and deploy the plugin to the test DHIS2 instance.

To run the plugin standalone for development use `yarn start`. Note that to avoid CORS issues the instance should be reachable via localhost. For remote instances use `yarn start --proxy=https://your-dhis2-server.org` and login using `http://localhost:8080` in the Server field.

In this mode `http://localhost:3000` doesn't render an actual Dashboard: it's a standalone test harness (`src/App.jsx`) that renders the plugin. It requires a `dashboardItemId` query param: `http://localhost:3000/?dashboardItemId=<id>`

To get a `dashboardItemId`:

- Install the plugin on the test instance and add it to a dashboard (see [Install in DHIS2](#install-in-dhis2)), or
- Pick the plugin id via `http://<host>/api/dashboards/<dashboardId>.json?fields=id,displayName,dashboardItems[id,appKey]`

With a valid id, the harness renders the plugin's **View mode** and **Edit mode** side by side, so config changes can be checked immediately. The two panes don't sync live with each other (each is its own datastore connection). Reload the page after saving a config change in the Edit pane to see it reflected in the View pane.

### D2 App Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `yarn test`

Launches the test runner and runs all available tests found in `/src`.<br />

See the section about [running tests](https://developers.dhis2.org/docs/app-platform/scripts/test) for more information.

#### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
A deployable `.zip` file can be found in `build/bundle`!

See the section about [building](https://developers.dhis2.org/docs/app-platform/scripts/build) for more information.

#### `yarn deploy`

Builds and deploys the built app in the `build` folder to a running DHIS2 instance.<br />
This command will prompt you to enter a server URL as well as the username and password of a DHIS2 user with the App Management authority.<br/>
Alternatively use: `D2_PASSWORD={password} yarn deploy {instance_url} -u {user}` to skip the aforementioned prompts.

See the section about [deploying](https://developers.dhis2.org/docs/app-platform/scripts/deploy) for more information.
