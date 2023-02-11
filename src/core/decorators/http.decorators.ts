import { Controller, ControllerOptions } from '@nestjs/common';

/** Tentant bound controller */
export function TController(): ClassDecorator;
export function TController(prefix: string | string[]): ClassDecorator;
export function TController(options: ControllerOptions): ClassDecorator;
export function TController(maybePrefixOrOptions?: string | string[] | ControllerOptions) {
  /** Removes leading slashes ('/') from `path` */
  const trimPath = (path: string): string => path.replace(/^\/+/, '')

  if (typeof maybePrefixOrOptions === undefined) {
    return Controller('/orgs/:organization_id/')
  }

  if (Array.isArray(maybePrefixOrOptions)) {
    maybePrefixOrOptions.push(
      ...maybePrefixOrOptions.map(path =>
        ('/orgs/:organization_id/').concat(trimPath(path))
      )
    )
    return Controller(maybePrefixOrOptions)
  }

  // TODO
  return Controller()
}
