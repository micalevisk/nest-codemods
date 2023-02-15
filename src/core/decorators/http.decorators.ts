import { Controller } from '@nestjs/common';

/** Removes leading slashes ('/') from `path` */
const trimPath = (path: string): string => path.replace(/^\/+/, '')

/** Tentant bound controller */
export function TController(): ClassDecorator;
export function TController(prefix: string | string[]): ClassDecorator;
export function TController(maybePrefix?: string | string[]): ClassDecorator {
  const PREFIX = 'orgs/:organization_id/';

  if (typeof maybePrefix === 'undefined') maybePrefix = ['/'];

  if (!Array.isArray(maybePrefix)) maybePrefix = [maybePrefix];

  maybePrefix.push(
    ...maybePrefix.map((path) => {
      const pathWithoutLeadingSlash = trimPath(path);
      if (pathWithoutLeadingSlash.startsWith(PREFIX)) return path;
      return (PREFIX).concat(pathWithoutLeadingSlash);
    })
  );

  return Controller(maybePrefix);
}
