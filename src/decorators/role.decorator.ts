import { SetMetadata } from '@nestjs/common';


export const ROLES_KEY = 'roles' 
export const Roles = (role) => SetMetadata(ROLES_KEY, role);
