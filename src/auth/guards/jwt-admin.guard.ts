import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAdminGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user || !user.isAdmin) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
