import { Get, Body, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TController } from './core/decorators/http.decorators';
import { OrganizationId } from './organization-id.decorator';

@ApiTags('cat')
@TController('cat')
// @Controller('/orgs/:organizationId/cat')
export class CatController {
  @Get()
  list(
    @OrganizationId() orgId: OrganizationId,
  ) {
    return {
      orgId: orgId || null,
    };
  }

  @Post()
  create(@Body() body: any) {
    return body
  }
}

@ApiTags('dog')
@TController(['dog1', 'dog2'])
// @Controller(['dog1', 'dog2', '/orgs/:organizationId/dog1', '/orgs/:organizationId/dog2'])
export class DogController {
  @Get()
  list(
    @OrganizationId() orgId: OrganizationId,
  ) {
    return {
      orgId: orgId || null,
    }
  }
}

@ApiTags('empty')
@TController()
// @Controller(['/orgs/:organizationId/'])
export class WithEmptyController {
  @Get('fish')
  list(
    @OrganizationId() orgId: OrganizationId,
  ) {
    return {
      orgId: orgId || null,
    }
  }
}
