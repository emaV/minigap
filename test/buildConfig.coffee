readBuildConfig = require("../src/cli/config")

config = readBuildConfig('./test/dummy/config')
console.log config._context("browser", "dev")
console.log config._files("browser", "dev")