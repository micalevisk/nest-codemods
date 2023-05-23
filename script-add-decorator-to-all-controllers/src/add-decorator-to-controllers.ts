// Powered by https://ts-morph.com
// https://ts-ast-viewer.com

import * as ts from 'ts-morph'
import * as path from 'path'

export function run({
  tsConfigPath,
  pathToTheDecoratorBeingAdded,
  dryRun = true,
}) {
  const tsConfigFilePath = path.resolve(tsConfigPath)
  const project = new ts.Project({
    tsConfigFilePath,
    manipulationSettings: {
      quoteKind: ts.QuoteKind.Single,
    },
  })

  const resolvedPathToTheDecoratorBeingAdded =
    project.getSourceFileOrThrow(
      path.resolve(pathToTheDecoratorBeingAdded)
    )

  project
    .getSourceFiles([
      path.dirname(tsConfigFilePath) + '/src/**/*.controller.ts',
    ])
    .forEach((sourceFile) => {
      if (sourceFile.isDeclarationFile()) return

      console.debug(sourceFile.getBaseName())

      if (dryRun) {
        sourceFile = sourceFile.copy(
          sourceFile.getFilePath() + '.new-controller.ts', {
          overwrite: true,
        })
      }

      const importDeclarationsWithOldImport: ts.ImportDeclaration[] = []
      addApiProjectDecoratorToControllerClassOnFile(importDeclarationsWithOldImport, sourceFile)
      addImportOfNewControllerDecorator(resolvedPathToTheDecoratorBeingAdded, sourceFile)
    })

  project.saveSync()
}

// ========================================================================== //

function isControllerDecl(importSpecifier: ts.ImportSpecifier) {
  return importSpecifier.getName() === 'Controller'
}

function getFirstControllerImportDeclaration(sourceFile: ts.SourceFile) {
  const importDeclartion = sourceFile.getImportDeclaration(
    (importDeclaration) => importDeclaration.getNamedImports()
      .some(isControllerDecl)
  )
  if (!importDeclartion) return;

  return importDeclartion
}

function addImportOfNewControllerDecorator(
  newControllerDecoratorSourceFile: ts.SourceFile,
  sourceFile: ts.SourceFile
) {
  const pathToNewController = sourceFile.getRelativePathAsModuleSpecifierTo(newControllerDecoratorSourceFile)

  const isImportedAlready = !!sourceFile.getImportDeclaration((importDecl) =>
    importDecl.getNamedImports().some(namedImport => namedImport.getName() === 'ApiProject'))

  if (!isImportedAlready) {
    sourceFile.addImportDeclaration({
      isTypeOnly: false,
      namedImports: ['ApiProject'],
      moduleSpecifier: pathToNewController,
    });
  }
}

function addApiProjectDecoratorToControllerClassOnFile(
  importDeclarationsWithOldImport: ts.ImportDeclaration[],
  sourceFile: ts.SourceFile,
) {
  const classes = sourceFile.getClasses()

  const declarationToRemove = getFirstControllerImportDeclaration(sourceFile)
  if (declarationToRemove) importDeclarationsWithOldImport.push(declarationToRemove)

  classes.forEach((classDecl) => {
    const firstControllerDecoratorDecl = classDecl.getDecorator('Controller')
    if (!firstControllerDecoratorDecl) return

    const isAnnotedWithTheDesiredDecoratorAlready = classDecl.getDecorator('ApiProject')
    if (isAnnotedWithTheDesiredDecoratorAlready) return

    classDecl.insertDecorator(1, {
      name: 'ApiProject',
      kind: ts.StructureKind.Decorator,
      arguments: ["'inspector'"],
    })
  })
}
