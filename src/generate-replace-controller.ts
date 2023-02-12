// Powered by https://ts-morph.com
// https://ts-ast-viewer.com

import * as ts from 'ts-morph'
import * as path from 'path'

function run({ dryRun = true }) {
  const tsConfigFilePath = path.resolve('./tsconfig.build.json')

  const project = new ts.Project({
    tsConfigFilePath,
    manipulationSettings: {
      quoteKind: ts.QuoteKind.Single,
    },
  })

  const newControllerDecoratorSourceFile =
    project.getSourceFileOrThrow('./src/core/decorators/http.decorators.ts')

  project
    .getSourceFiles([
      './src/**/*.controller.ts',
    ])
    .forEach((sourceFile) => {
      const isControllerFile = sourceFile.getBaseName().endsWith('.controller.ts')
      if (sourceFile.isDeclarationFile() || !isControllerFile) return;

      if (dryRun) {
        console.log(sourceFile.getBaseName());
        sourceFile = sourceFile.copy(
          sourceFile.getFilePath() + '.new-controller.ts', {
          overwrite: true,
        })
      }

      swapDecoratorsOnFile(newControllerDecoratorSourceFile, sourceFile)
    })

  project.saveSync()
}

run({ dryRun: true })


// ========================================================================== //

function removeFirstControllerImportDeclaration(sourceFile: ts.SourceFile) {
  const isControllerDecl = (importSpecifier: ts.ImportSpecifier) =>
    importSpecifier.getName() === 'Controller'

  const importWithDefaultImport = sourceFile.getImportDeclarationOrThrow(
    (importDeclaration) => importDeclaration.getNamedImports()
      .some(isControllerDecl)
  )
  if (!importWithDefaultImport) return false

  const namedImports = importWithDefaultImport.getNamedImports()
  namedImports.find(isControllerDecl)?.remove()

  return true
}

function addImportOfNewControllerDecorator(
  newControllerDecoratorSourceFile: ts.SourceFile,
  sourceFile: ts.SourceFile
) {
  const pathToNewController = sourceFile.getRelativePathAsModuleSpecifierTo(newControllerDecoratorSourceFile)

  sourceFile.addImportDeclaration({
    isTypeOnly: false,
    namedImports: ['TController'],
    moduleSpecifier: pathToNewController,
  });
}

function isControllerDecorator(decorator: ts.Decorator) {
  return decorator.getName().toLowerCase() === 'controller' && decorator.isDecoratorFactory()
}

function swapDecoratorsOnFile(
  newControllerDecoratorSourceFile: ts.SourceFile,
  sourceFile: ts.SourceFile,
) {
  const classes = sourceFile.getClasses()

  if (!removeFirstControllerImportDeclaration(sourceFile)) return

  addImportOfNewControllerDecorator(newControllerDecoratorSourceFile, sourceFile)

  classes.forEach((classDecl) => {
    const firstControllerDecoratorDecl = classDecl
      .getDecorators()
      .filter(isControllerDecorator)
      .pop()
    if (!firstControllerDecoratorDecl) return

    firstControllerDecoratorDecl.getNameNode().replaceWithText('TController')
  })
}
