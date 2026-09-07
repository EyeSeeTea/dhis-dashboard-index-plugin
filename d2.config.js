/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: "app",
    name: "Dashboard Index",
    pluginType: "DASHBOARD",
    entryPoints: {
        // d2-app-scripts sets NODE_ENV=development for `start` and defaults to `production` for `build`/`deploy`.
        // The app entry point is for local testing, not meant to be included in the build.
        app: process.env.NODE_ENV === "development" ? "./src/App.jsx" : undefined,
        plugin: "./src/Plugin.tsx",
    },
    direction: "auto",
    dataStoreNamespace: "dashboard-index-plugin",
};

module.exports = config;
