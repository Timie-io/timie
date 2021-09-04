import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUser } from './dto/sign-up.user';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('/signup')
  async signUp(@Body() body: SignUpUser) {
    const user = await this.authService.signUp(body);
    return this.authService.login(user);
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
