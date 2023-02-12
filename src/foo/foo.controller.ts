import { Controller } from '@nestjs/common';

@Controller()
export class FooController {}

// edge case not covered because it doesn't exist in the repo 'tarkenag/hub-server'
@Controller({ path: 'bar' })
export class BardController {}