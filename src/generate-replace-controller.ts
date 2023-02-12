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
      if (sourceFile.isDeclarationFile()) return;

      if (dryRun) {
        console.log(sourceFile.getBaseName());
        sourceFile = sourceFile.copy(
          sourceFile.getFilePath() + '.new-controller.ts', {
          overwrite: true,
        })
      }

      const declarationsToRemove: ts.ImportSpecifier[] = []
      swapDecoratorsOnFile(declarationsToRemove, newControllerDecoratorSourceFile, sourceFile)
      removeImportDeclarations(declarationsToRemove)
    })

  project.saveSync()
}

run({ dryRun: true })


// ========================================================================== //

function removeImportDeclarations(importSpecifier: ts.ImportSpecifier[]) {
  importSpecifier.forEach(declaration => declaration.remove())
}

function getFirstControllerImportDeclaration(sourceFile: ts.SourceFile) {
  const isControllerDecl = (importSpecifier: ts.ImportSpecifier) =>
    importSpecifier.getName() === 'Controller'

  const importWithDefaultImport = sourceFile.getImportDeclarationOrThrow(
    (importDeclaration) => importDeclaration.getNamedImports()
      .some(isControllerDecl)
  )
  if (!importWithDefaultImport) return;

  const namedImports = importWithDefaultImport.getNamedImports()
  return namedImports.find(isControllerDecl)
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
  declarationsToRemove: ts.ImportSpecifier[],
  newControllerDecoratorSourceFile: ts.SourceFile,
  sourceFile: ts.SourceFile,
) {
  const classes = sourceFile.getClasses()

  const declarationToRemove = getFirstControllerImportDeclaration(sourceFile)
  if (declarationToRemove) declarationsToRemove.push(declarationToRemove)

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
