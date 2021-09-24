import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AllowSignupEmailDto } from './dto/allow-signup.email';
import { SignUpUser } from './dto/sign-up.user';
import { JwtAdminGuard } from './guards/jwt-admin.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('/signup')
  async signUp(@Body() body: SignUpUser) {
    const signupRestricted = this.configService.get('SIGNUP_RESTRICTED');
    if (signupRestricted === '1') {
      const allowed = await this.authService.signupAllowed(body.email);
      if (!allowed) {
        throw new ForbiddenException('Action not allowed');
      }
    }
    const user = await this.authService.signUp(body);
    return this.authService.login(user);
  }

  @UseGuards(JwtAdminGuard)
  @Post('/allow')
  async allowSignUpEmail(@Body() body: AllowSignupEmailDto) {
    return await this.authService.allowSignup(body.email, body.expireSeconds);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh')
  async refresh(@Request() req) {
    return this.authService.login(req.user);
  }
}
