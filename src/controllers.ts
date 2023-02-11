import { Get, Body, Headers, Param, Post, Query, Req } from '@nestjs/common';
import { TController } from './core/decorators/http.decorators';
import { OrganizationId } from './organization-id.decorator';

// from this:
@TController('cat')
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
@TController(['dog1', 'dog2'])
// @Controller(['dog1', 'dog2', '/org/:organizationId/dog1', '/org/:organizationId/dog2'])
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

@TController()
// @Controller(['/org/:organizationId/'])
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
