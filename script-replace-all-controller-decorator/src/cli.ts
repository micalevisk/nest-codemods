import { run } from './replace-controller-decorators'

const [
  tsConfigPath,
  pathToNewController,
] = process.argv.slice(2)

run({
  tsConfigPath,
  pathToNewController,
  dryRun: false,
})