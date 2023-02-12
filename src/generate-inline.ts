// Powered by https://ts-morph.com
// https://ts-ast-viewer.com
/**
 * 1. Pra cada arquivo que termina com '.controller.ts' no diretório informado,
 * 2. Iterar em todas declarações de classes que possuem o decorator factory '@Controller()',
 * 3. Fazendo o seguinte refactoring,
 *    1. Conciliar os argumentos de `@Controller()` em um só: um array de strings
 *    2. Executar append na lista de argumentos de cada chamada `@Controller()`
 * 4. Persistir mudanças no próprio arquivo
 */

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

  project
    .getSourceFiles([
      './src/**/*.controller.ts',
    ])
    .forEach(sourceFile => {
    const isControllerFile = sourceFile.getBaseName().endsWith('.controller.ts')
    if (sourceFile.isDeclarationFile() || !isControllerFile) return;

    if (dryRun) {
      console.log(sourceFile.getBaseName());
      sourceFile = sourceFile.copy(
        sourceFile.getFilePath() + '.new-controller.ts', {
        overwrite: true,
      })
    }

    swapDecoratorsOnFile(sourceFile)
  })

  project.saveSync()
}

run({ dryRun: true })


// ========================================================================== //

function trimPath(path: string): string {
  return path.replace(/^\/+/, '')
}

function isControllerDecorator(decorator: ts.Decorator): boolean {
  return decorator.getName().toLowerCase() === 'controller' && decorator.isDecoratorFactory()
}

function swapDecoratorsOnFile(sourceFile: ts.SourceFile) {
  const classes = sourceFile.getClasses()

  classes.forEach((classDecl) => {
    const firstControllerDecoratorDecl = classDecl
      .getDecorators()
      .filter(isControllerDecorator)
      .pop()
    if (!firstControllerDecoratorDecl) return

    let controllerArgsValuesDecl = firstControllerDecoratorDecl.getArguments()

    // Replace `@Controller()` with `@Controller(['/'])`
    if (controllerArgsValuesDecl.length === 0) firstControllerDecoratorDecl.addArgument(`['/']`)

    let firstArgOnControllerDecorator = firstControllerDecoratorDecl.getArguments().pop()
    if (!firstArgOnControllerDecorator) return

    // Replace `@Controller('path')` with `@Controller(['/path'])`
    if (ts.Node.isStringLiteral(firstArgOnControllerDecorator)) {
      const value = firstArgOnControllerDecorator.getLiteralValue()
      firstControllerDecoratorDecl.addArgument(`['${value}']`)
      firstControllerDecoratorDecl.removeArgument(0)
      firstArgOnControllerDecorator = firstControllerDecoratorDecl.getArguments().pop()
    }

    // Replace `@Controller(['path1', 'path2'])` with paths with prefix version
    if (ts.Node.isArrayLiteralExpression(firstArgOnControllerDecorator)) {
      const newArgs: string[] = []
       firstArgOnControllerDecorator
        .getElements()
        .forEach((arrElementDecl) => {
          if (!ts.Node.isStringLiteral(arrElementDecl)) return;

          const currentPath = trimPath(arrElementDecl.getLiteralValue() || '')
          newArgs.push(`'/orgs/:organization_id/${(currentPath)}'`)
        })
      firstArgOnControllerDecorator.addElements(newArgs, { useNewLines: false })
    } else {
      console.error(`Edge-case found: the first arg of @Controller() is not an array literal expression!\n\t${firstArgOnControllerDecorator?.getKindName()}`)
    }
  })
}
