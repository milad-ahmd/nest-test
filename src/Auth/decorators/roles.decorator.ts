import { SetMetadata } from '@nestjs/common';
import { Privilege } from 'src/User/model/privilege.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Privilege[]) => SetMetadata(ROLES_KEY, roles);
