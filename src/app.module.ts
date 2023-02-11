import { Module, forwardRef, Type, DynamicModule, Inject, createParamDecorator } from '@nestjs/common';
import { MODULE_PATH, PATH_METADATA } from '@nestjs/common/constants';
import { Controller, ExecutionContext } from '@nestjs/common/interfaces';
import { ModulesContainer } from '@nestjs/core';
import { CatController, DogController } from './controllers';

// 1) Declarar uma middleware catch-all com path '/orgs/:org_id/' (ex: /api/v1/foo tem alias pra /api/v1/orgs/:org_id/foo)
//    Isso ficará implícito no app. Não é possível mostrar nos logs do NestJS.
//    Não gera doc no OpenApi.
// 2) Usar um dynamic module (parecido com o nativo RouterModule) para hyjacking dos path alias pra cada controller encontrado
// 2) Alterar todos os decorators `@Controller()` pra adicionar um outro path alias



export const validatePath = (path: string): string =>
  path
    ? path.startsWith('/')
      ? ('/' + path.replace(/\/+$/, '')).replace(/\/+/g, '/')
      : '/' + path.replace(/\/+$/, '')
    : '/';

@Module({
  controllers: [CatController]
})
class RouterModule {
  private static readonly routesContainer: Map<string, string> = new Map();

  @Inject('modules') private readonly modules: Type<any>[]

  constructor(private readonly modulesContainer: ModulesContainer) {
    this.initialize()
  }

  onModuleInit() {
    // this.initialize()
  }

  static forRoot(modules: Type<any>[]): DynamicModule {
    return {
      module: RouterModule,
      providers: [
        {
          provide: 'modules',
          useValue: modules,
        },
      ],
    }
  }

  private initialize() {
    this.modules.forEach((ModuleCtor) => {
      this.registerModulePathMetadata(ModuleCtor, '/org/:org_id/')
    })
  }

  /**
   * get the controller full route path eg: (controller's module prefix + controller's path).
   * @param {Type<Controller>} controller the controller you need to get it's full path
   */
  public static resolvePath(controller: Type<Controller>): string {
    const controllerPath: string = Reflect.getMetadata(PATH_METADATA, controller);
    const modulePath = RouterModule.routesContainer.get(controller.name);
    if (modulePath && controllerPath) {
      return validatePath(modulePath + validatePath(controllerPath));
    } else {
      throw new Error();
    }
  }

  private static buildPathMap(routes: any) {
    // const flattenRoutes = flatRoutes(routes);
    // flattenRoutes.forEach(route => {
    //   Reflect.defineMetadata(MODULE_PATH, validatePath(route.path), route.module);
    // });
  }

  private registerModulePathMetadata(
    moduleCtor: Type<unknown>,
    modulePath: string,
  ) {
    Reflect.defineMetadata(
      MODULE_PATH + this.modulesContainer.applicationId,
      modulePath,
      moduleCtor,
    );
  }
}

@Module({
  controllers: [
    CatController,
    DogController,
  ],
})
class CatModule {}

@Module({
  imports: [
      CatModule,
    // RouterModule.forRoot([
    //   CatModule,
    // ])
  ]

  // providers: [dynamicProvider1, dynamicProvider2],
})
export class AppModule {}
