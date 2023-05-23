import { run } from './add-decorator-to-controllers'

const [
  tsConfigPath,
  pathToTheDecoratorBeingAdded,
] = process.argv.slice(2)

run({
  tsConfigPath,
  pathToTheDecoratorBeingAdded,
  dryRun: false,
})