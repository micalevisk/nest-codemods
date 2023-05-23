```bash
cd script-replace-all-controller-decorator
npm ci
npm start ../tsconfig.build.json ../src/core/decorators/http.decorators.ts
##         ^ path to the tsconfig file  |
##                                      +--> path to the new decorator to use
```