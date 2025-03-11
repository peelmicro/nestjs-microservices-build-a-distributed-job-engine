import { Controller, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './token-payload.interface';
import { AuthServiceControllerMethods } from 'types/proto/auth';
import {
  AuthenticateRequest,
  AuthServiceController,
  User,
} from 'types/proto/auth';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  authenticate(
    request: AuthenticateRequest & { user: TokenPayload },
  ): Promise<User> | Observable<User> | User {
    return this.usersService.getUser({ id: request.user.userId });
  }
}
