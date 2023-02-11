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

import { Project, Node, SourceFile } from 'ts-morph'
import * as path from 'path'

const tsConfigFilePath = path.resolve('./tsconfig.build.json')

const project = new Project({
  tsConfigFilePath,
})

// ========================================================================== //


function swapDecoratorsOnFile(sourceFile: SourceFile) {
  const trimPath = (path: string): string => path.replace(/^\/+/, '')

  const classes = sourceFile.getClasses()

  classes.forEach((classDecl) => {
    console.log(classDecl.getName())

    const controllerDecoratorDecl = classDecl
      .getDecorators()
      .filter(decoratorDecl => decoratorDecl.getName().toLowerCase() === 'controller')
      .pop()

    if (controllerDecoratorDecl && controllerDecoratorDecl.isDecoratorFactory()) {
      let controllerArgsValuesDecl = controllerDecoratorDecl.getArguments()
      if (controllerArgsValuesDecl.length === 0) {
        controllerDecoratorDecl.addArgument(`['/']`);
      }

      let firstArg = controllerDecoratorDecl.getArguments().pop()
      if (!firstArg) return;

      if (Node.isStringLiteral(firstArg)) {
        const value = firstArg.getLiteralValue()
        controllerDecoratorDecl.addArgument(`['${value}']`)
        controllerDecoratorDecl.removeArgument(0)
        firstArg = controllerDecoratorDecl.getArguments().pop()
      }

      if (Node.isArrayLiteralExpression(firstArg)) {
        const newArgs: string[] = []
         firstArg
          .getElements()
          .forEach((arrElementDecl) => {
            if (!Node.isStringLiteral(arrElementDecl)) return;

            const currentPath = trimPath(arrElementDecl.getLiteralValue() || '')
            newArgs.push(`'/orgs/:organization_id/${(currentPath)}'`)
          })
        firstArg.addElements(newArgs, { useNewLines: false })
      } else {
        console.error(`Edge-case found: the first arg of @Controller() is not an array literal expression!\n\t${firstArg?.getKindName()}`)
      }
    }
  })
}

project
  .getSourceFiles()
  .forEach(sourceFile => {
  const isControllerFile = sourceFile.getBaseName().endsWith('.controller.ts')
  if (sourceFile.isDeclarationFile() || !isControllerFile) return;

  console.log(sourceFile.getBaseName());
  const newSourceFile = sourceFile.copy(
    sourceFile.getFilePath() + '.new-controller.ts', {
    overwrite: true,
  })

  swapDecoratorsOnFile(newSourceFile)
})



project.saveSync()