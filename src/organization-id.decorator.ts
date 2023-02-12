import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import type { Request } from "express";

/**
 * Decorator factory to use at some controller's method to retrieve the id of
 * the current user's organization.
 * It resolves to `undefined` if there is no way to retrieve such info from request
 * payload for whatever reason.
 *
 * @example
 *
 * ```js
 * @OrganizationId() orgId: OrganizationId
 * ```
 */
export const OrganizationId = createParamDecorator<never, ExecutionContext, string | undefined>((_, ctx) => {
  const req = ctx.switchToHttp().getRequest<Request>();

  // TODO: validate that the organizationId is a valid UUID

  return req.params['organization_id'] || undefined
})
export type OrganizationId = string | undefined