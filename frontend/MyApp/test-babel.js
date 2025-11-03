const babel = require("@babel/core");
const fs = require("fs");

const config = babel.loadPartialConfig({
    filename: "./index.js",
});

console.log("=== Babel loaded config from:", config.options.configFile || "none");
console.log("=== Presets:", config.options.presets);
console.log("=== Plugins:", config.options.plugins);
