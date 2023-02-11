import { Controller, Get, Body, Header, Headers, Param, Post, Query, Req } from '@nestjs/common';
import { OrganizationId } from './organization-id.decorator';

// from this:
@Controller({
  path: 'cat',
  version: ['1', '2']
})
// to this:
// @Controller(['cat', '/org/:organizationId/cat'])
// from this:
// @Controller()
// to this:
// @Controller('/org/:organizationId/cat')
export class CatController {
  @Get()
  list(
    @Req() req: any,
    @Param('organizationId') organizationId: string,
    @OrganizationId() orgId: OrganizationId,
    @Query() query: string,
    @Headers('x-foo') headerValue: string,
  ) {
    console.log('>>>>>>>>>>>>>>>>> list cat');

    return {
      foo: query,
      reqParams: req.params,
      reqHeaders: req.headers,
      headerValue: headerValue || null,
      orgId: orgId || null,
      organizationId: organizationId || null
    }
  }

  @Post()
  create(@Body() body: any) {
    return body
  }
}

// from this:
@Controller(['dog'])
// to thus:
// @Controller(['dog', '/org/:organizationId/dog'])
export class DogController {
  @Get()
  list(
    @Param('organizationId') organizationId: string,
  ) {
    return {
      organizationId: organizationId || null
    }
  }
}

// from this:
@Controller()
// to thus:
// @Controller(['/org/:organizationId/cat'])
export class WithEmptyController {
  @Get('fish')
  list(
    @Param('organizationId') organizationId: string,
  ) {
    return {
      organizationId: organizationId || null
    }
  }
}
