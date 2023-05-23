```bash
cd script-add-decorator-to-all-controllers
npm ci
npm start ../tsconfig.build.json ../src/core/decorators/api-project.decorator.ts
##         ^ path to the tsconfig file  |
##                                      +--> path to the new decorator to use
```