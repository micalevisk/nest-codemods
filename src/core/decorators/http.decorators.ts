import { Controller } from '@nestjs/common';

/** Tentant bound controller */
export function TController(): ClassDecorator;
export function TController(prefix: string | string[]): ClassDecorator;
export function TController(maybePrefix?: string | string[]) {
  /** Removes leading slashes ('/') from `path` */
  const trimPath = (path: string): string => path.replace(/^\/+/, '')

  if (typeof maybePrefix === 'undefined') {
    maybePrefix = '/orgs/:organization_id/'
  }

  if (Array.isArray(maybePrefix)) {
    maybePrefix.push(
      ...maybePrefix.map(path =>
        ('/orgs/:organization_id/').concat(trimPath(path))
      )
    )
  }

  return Controller(maybePrefix)
}
