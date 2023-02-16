// Powered by https://ts-morph.com
// https://ts-ast-viewer.com

import * as ts from 'ts-morph'
import * as path from 'path'

export function run({
  tsConfigPath,
  pathToNewController,
  dryRun = true,
}) {
  const tsConfigFilePath = path.resolve(tsConfigPath)
  const project = new ts.Project({
    tsConfigFilePath,
    manipulationSettings: {
      quoteKind: ts.QuoteKind.Single,
    },
  })

  const newControllerDecoratorSourceFile =
    project.getSourceFileOrThrow(
      path.resolve(pathToNewController)
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
      swapDecoratorsOnFile(importDeclarationsWithOldImport, sourceFile)
      removeImportDeclarations(importDeclarationsWithOldImport)
      addImportOfNewControllerDecorator(newControllerDecoratorSourceFile, sourceFile)
    })

  project.saveSync()
}

// ========================================================================== //

function isControllerDecl(importSpecifier: ts.ImportSpecifier) {
  return importSpecifier.getName() === 'Controller'
}

function removeImportDeclarations(importDeclarationsWithOldImport: ts.ImportDeclaration[]) {
  const importSpecifiers: {
    importDeclaration: ts.ImportDeclaration
    importSpecifier: ts.ImportSpecifier
  }[] = []

  // Search all import specifiers for the old import that should be removed
  // as well as their import declarations
  importDeclarationsWithOldImport.forEach((importDeclaration) => {
    const namedImports = importDeclaration.getNamedImports()
    const importSpecifier = namedImports.find(isControllerDecl)
    if (importSpecifier) {
      importSpecifiers.push({
        importDeclaration,
        importSpecifier,
      })
    }
  })

  importSpecifiers.forEach(({ importDeclaration, importSpecifier }) => {
    const hasSiblingImportSpecifiers = !!importDeclaration.getNextSibling()
    if (hasSiblingImportSpecifiers) {
      importDeclaration.remove()
    } else {
      importSpecifier.remove()
    }
  })
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

  sourceFile.addImportDeclaration({
    isTypeOnly: false,
    namedImports: ['TController'],
    moduleSpecifier: pathToNewController,
  });
}

function shouldReplaceControllerDecorator(decorator: ts.Decorator): boolean {
  const firstArg = decorator.getArguments().pop()
  if (!firstArg) return true
  return !firstArg.isKind(ts.SyntaxKind.ObjectLiteralExpression)
}

function isControllerDecorator(decorator: ts.Decorator) {
  return decorator.getName().toLowerCase() === 'controller' && decorator.isDecoratorFactory()
}

function swapDecoratorsOnFile(
  importDeclarationsWithOldImport: ts.ImportDeclaration[],
  sourceFile: ts.SourceFile,
) {
  const classes = sourceFile.getClasses()

  const declarationToRemove = getFirstControllerImportDeclaration(sourceFile)
  if (declarationToRemove) importDeclarationsWithOldImport.push(declarationToRemove)

  classes.forEach((classDecl) => {
    const firstControllerDecoratorDecl = classDecl
      .getDecorators()
      .filter(isControllerDecorator)
      .pop()
    if (!firstControllerDecoratorDecl) return

    if (shouldReplaceControllerDecorator(firstControllerDecoratorDecl)) {
      firstControllerDecoratorDecl.getNameNode().replaceWithText('TController')
    } else {
      importDeclarationsWithOldImport.pop() // Should not remove the import declaration
    }
  })
}
