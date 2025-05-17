import { 
  BadRequestException, 
  Body, 
  Controller, 
  Get, 
  HttpCode, 
  HttpStatus, 
  Post, 
  UnauthorizedException, 
  UseGuards 
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiBadRequestResponse, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiTags, 
  ApiUnauthorizedResponse 
} from '@nestjs/swagger';

import { LoginUserCommand } from '@application/auth/commands/impl/login-user.command';
import { RegisterUserCommand } from '@application/auth/commands/impl/register-user.command';
import { CurrentUser } from '@application/auth/decorators/current-user.decorator';
import { GetUserProfileQuery } from '@application/auth/queries/impl/get-user-profile.query';
import { User } from '@domain/models/user.model';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { AuthResponse, LoginDto, RegisterDto, UserDto } from '@libs/shared/dto/auth';
import { LoggerService } from '@libs/logger/src/logger.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered and referral bonus applied if referral code is provided.',
    type: AuthResponse })
  @ApiBadRequestResponse({
    description: 'Invalid registration data or user already exists',
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    try {
      this.logger.debug('Registering new user', { email: dto.email });
      // Register user and apply referral code if provided
      await this.commandBus.execute(
        new RegisterUserCommand(dto.email, dto.password, dto.firstName, dto.lastName, dto.referralCode),
      );
      
      // Login user
      return this.commandBus.execute(
        new LoginUserCommand(dto.email, dto.password),
      );
    } catch (error) {
      this.logger.error('Registration failed', error, { email: dto.email });
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully logged in', type: AuthResponse })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    try {
      this.logger.debug('Logging in user', { email: dto.email });
      return await this.commandBus.execute(
        new LoginUserCommand(dto.email, dto.password),
      );
    } catch (error) {
      this.logger.error('Login failed', error, { email: dto.email });
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile retrieved successfully', type: UserDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async getProfile(@CurrentUser() user: User): Promise<UserDto> {
    this.logger.debug('Getting user profile', { userId: user.id });
    return this.queryBus.execute(new GetUserProfileQuery(user.id));
  }
}
