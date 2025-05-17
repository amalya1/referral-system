import {Injectable, UnauthorizedException, ConflictException, BadRequestException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@domain/models/user.model';
import { LoginDto, RegisterDto, AuthResponse } from '@libs/shared/dto/auth';
import { UserStore } from '@infrastructure/stores/user.store';
import {ReferralService} from "@application/referral/services/referral.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userStore: UserStore,
    private readonly jwtService: JwtService,
    private readonly referralService: ReferralService
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userStore.findByEmail(email);
    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  generateAuthResponse(user: User): AuthResponse {
    const payload = { sub: user.id, email: user.email };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.generateAuthResponse(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const exists = await this.userStore.exists(registerDto.email);
    if (exists) {
      throw new ConflictException('User with this email already exists');
    }

    if (registerDto.referralCode) {
      const isReferralValid = await this.referralService.validateReferralCode(registerDto.referralCode);

      if (!isReferralValid) {
        throw new BadRequestException('Referral code does not exist');
      }
    }

    const user = await User.create(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName
    );

    const savedUser = await this.userStore.save(user);
    return this.generateAuthResponse(savedUser);
  }
}
