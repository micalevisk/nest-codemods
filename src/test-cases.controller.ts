import { Controller, Get } from '@nestjs/common';
import { ApiProduces } from '@nestjs/swagger';
import { ApiProject } from './core/decorators/api-project.decorator';

// no args
@Controller()
@ApiProduces()
export class A {}

// one simple args
@Controller('b')
@ApiProject('foo')
export class B {}

// one simple args (2)
@Controller('b/c/d/e')
export class B2 {}

// multiple simple args
@Controller([''])
export class C {}

// multiple simple args (2)
@Controller(['c', 'cc'])
export class C2 {}

// multiple simple args (3)
@Controller(['/c/foo/bar'])
export class C3 {}

// edge case not covered because it doesn't exist in the repo 'tarkenag/hub-server'
@Controller({ path: 'bar' })
export class D {}

/* // Casos não cobertos pois não possuem na codebase do repositório 'tarkenag/hub-server'

// empty opts
@Controller({})
export class D {}

// with opts.path
@Controller({
  path: '/',
})
export class E {}

// with opts but no opts.path
@Controller({
  version: '1'
})
export class F {}

*/