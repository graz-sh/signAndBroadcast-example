// @ts-check

const { extendEslint } = require("@graz-sh/style-guide-core");

module.exports = extendEslint(["node", "typescript"], {
  root: true,
});
