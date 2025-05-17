import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { BaseModel, BaseProps } from '@domain/models/base.model';

export interface UserProps extends BaseProps {
  id?: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  referralCode?: string;
  referrerId?: string;
  level?: number;
  streak?: number;
  credits?: number;
  lastInviteAt?: Date;
}

@Entity('users')
export class User extends BaseModel<UserProps> {
  constructor(props: Partial<UserProps> = {}) {
    super({
      email: props.email,
      password: props.password,
      firstName: props.firstName,
      lastName: props.lastName,
      isEmailVerified: props.isEmailVerified ?? false,
      lastLoginAt: props.lastLoginAt,
      id: props.id,
      referralCode: props.referralCode,
      referrerId: props.referrerId,
      level: props.level ?? 1,
      streak: props.streak ?? 0,
      credits: props.credits ?? 0,
      lastInviteAt: props.lastInviteAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    });
  }

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  get email(): string {
    return this.props.email;
  }
  set email(value: string) {
    this.props.email = value;
  }

  @Column({ type: 'varchar' })
  @Exclude()
  get password(): string {
    return this.props.password;
  }
  set password(value: string) {
    this.props.password = value;
  }

  @Column({ type: 'varchar', nullable: true })
  get firstName(): string | undefined {
    return this.props.firstName;
  }
  set firstName(value: string | undefined) {
    this.props.firstName = value;
  }

  @Column({ type: 'varchar', nullable: true })
  get lastName(): string | undefined {
    return this.props.lastName;
  }
  set lastName(value: string | undefined) {
    this.props.lastName = value;
  }

  @Column({ type: 'boolean', default: false })
  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }
  set isEmailVerified(value: boolean) {
    this.props.isEmailVerified = value;
  }

  @Column({ type: 'timestamp with time zone', nullable: true })
  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }
  set lastLoginAt(value: Date | undefined) {
    this.props.lastLoginAt = value;
  }
  //
  // @OneToMany(() => WorkspaceMember, member => member.user)
  // workspaces: WorkspaceMember[];

  @Column({ type: 'varchar', nullable: true })
  get referralCode(): string | undefined {
    return this.props.referralCode;
  }
  set referralCode(value: string | undefined) {
    this.props.referralCode = value;
  }

  @Column({ type: 'uuid', nullable: true })
  get referrerId(): string | undefined {
    return this.props.referrerId;
  }
  set referrerId(value: string | undefined) {
    this.props.referrerId = value;
  }

  @ManyToOne(() => User, user => user.referrals, { nullable: true })
  @JoinColumn({ name: 'referrerId' })
  referrer: User;

  @OneToMany(() => User, user => user.referrer)
  referrals: User[];

  @Column({ type: 'int', default: 1 })
  get level(): number {
    return this.props.level;
  }
  set level(value: number) {
    this.props.level = value;
  }

  @Column({ type: 'int', default: 0 })
  get streak(): number {
    return this.props.streak;
  }
  set streak(value: number) {
    this.props.streak = value;
  }

  @Column({ type: 'int', default: 0 })
  get credits(): number {
    return this.props.credits;
  }
  set credits(value: number) {
    this.props.credits = value;
  }

  @Column({ type: 'timestamp with time zone', nullable: true })
  get lastInviteAt(): Date | undefined {
    return this.props.lastInviteAt;
  }
  set lastInviteAt(value: Date | undefined) {
    this.props.lastInviteAt = value;
  }

  async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  updateLastLogin(): void {
    this.lastLoginAt = new Date();
  }

  generateReferralCode(): string {
    return Math.random().toString(36).slice(2, 11);
  }

  updateLastInvite(): void {
    this.lastInviteAt = new Date();
  }

  static async create(email: string, password: string, firstName?: string, lastName?: string): Promise<User> {
    const user = new User({
      email,
      password: '',
      firstName,
      lastName,
      isEmailVerified: false,
    });

    await user.setPassword(password);
    user.referralCode = user.generateReferralCode();
    return user;
  }

  toJSON(): Partial<UserProps> {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      isEmailVerified: this.isEmailVerified,
      lastLoginAt: this.lastLoginAt,
      referralCode: this.referralCode,
      referrerId: this.referrerId,
      level: this.level,
      streak: this.streak,
      credits: this.credits,
      lastInviteAt: this.lastInviteAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
