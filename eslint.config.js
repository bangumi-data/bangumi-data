const { defineConfig } = require("eslint/config");
const globals = require("globals");
const js = require("@eslint/js");

module.exports = defineConfig([
    {
        files: ["**/*.js"],

        plugins: { js },

        extends: ["js/recommended"],

        languageOptions: {
            globals: {
                ...globals.node,
            },
        },

        rules: {},
    },
]);
