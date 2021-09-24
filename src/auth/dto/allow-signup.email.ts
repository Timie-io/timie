import { IsEmail, Max, Min } from 'class-validator';

export class AllowSignupEmailDto {
  @IsEmail()
  email: string;

  @Min(60)
  @Max(86400)
  expireSeconds: number;
}
