import { ApiTags } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
const shouldGeneratePublicApi = process.env.MODIFIED_SWAGGER === 'true';
const noop = (): void => void undefined;

export const ApiProject = (project: string): ClassDecorator => {
  project = `project-${project}`;
  if (!shouldGeneratePublicApi) return noop;

  return (target: any) => {
    const maybeDefinedTags: string[] | undefined = Reflect.getMetadata(
      DECORATORS.API_TAGS,
      target,
    );
    if (maybeDefinedTags) {
      maybeDefinedTags.push(project);
      ApiTags(...maybeDefinedTags)(target);
    } else {
      ApiTags(project)(target);
    }
  };
};