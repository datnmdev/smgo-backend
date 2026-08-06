import { Inject } from '@nestjs/common';

export const getRepositoryToken = (repoImplClass: Function) => {
  return `MY_REPOSITORY_${repoImplClass.name}`;
};

export const InjectRepository = (repoImplClass: Function) => {
  return Inject(getRepositoryToken(repoImplClass));
};
