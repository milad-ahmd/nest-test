import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, Users } from './model/user';
import { RolesGuard } from 'src/Auth/guards/roles.guard';
import { UserController } from './user.controller';
import { Role, Roles } from './model/role';
import { RoleService } from './services/role.service';
import { RoleController } from './role.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: Users,
      },
      {
        name: Role.name,
        schema: Roles,
      },
    ]),
  ],
  providers: [UserService, RolesGuard, RoleService],
  exports: [UserService, RoleService],
  controllers: [UserController, RoleController],
})
export class UserModule {}
