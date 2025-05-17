import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserStore } from '@infrastructure/stores/user.store';
import { WorkspaceStore } from '@infrastructure/stores/workspace.store';

interface JwtPayload {
  sub: string;
  email: string;
  workspaceId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userStore: UserStore,
    private readonly workspaceStore: WorkspaceStore,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userStore.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    const result: any = user.toJSON();

    // If workspaceId is in the token, verify access and add workspace info
    if (payload.workspaceId) {
      const workspace = await this.workspaceStore.findById(payload.workspaceId);
      if (!workspace || !workspace.hasAccess(user.id!)) {
        throw new UnauthorizedException('No access to this workspace');
      }
      result.currentWorkspace = workspace.toJSON();
      result.workspaceRole = workspace.getUserRole(user.id!);
    }

    return result;
  }
}
