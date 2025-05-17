import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@domain/models/user.model';
import { BaseModel, BaseProps } from '@domain/models/base.model';

export enum WorkspaceMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface WorkspaceProps extends BaseProps {
  id?: string;
  name?: string;
  ownerId?: string;
}

@Entity('workspaces')
export class Workspace extends BaseModel<WorkspaceProps> {
  constructor(props: WorkspaceProps = {}) {
    super({
      ...props,
      name: props.name || '',
      ownerId: props.ownerId || ''
    });
  }

  @PrimaryGeneratedColumn('uuid')
  get id(): string {
    return this.props.id!;
  }

  @Column({ type: 'varchar' })
  get name(): string {
    return this.props.name!;
  }

  @Column({ type: 'uuid' })
  get ownerId(): string {
    return this.props.ownerId!;
  }

  @OneToMany(() => WorkspaceMember, member => member.workspace)
  members: WorkspaceMember[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  get createdAt(): Date {
    return this.props.createdAt!;
  }

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  hasAccess(userId: string): boolean {
    return this.members?.some(member => member.userId === userId) || false;
  }

  getUserRole(userId: string): WorkspaceMemberRole | null {
    const member = this.members?.find(m => m.userId === userId);
    return member?.role || null;
  }

  addMember(userId: string, role: WorkspaceMemberRole = WorkspaceMemberRole.MEMBER): void {
    if (!this.members?.some(m => m.userId === userId)) {
      const member = new WorkspaceMember();
      member.workspaceId = this.id;
      member.userId = userId;
      member.role = role;
      this.members = [...(this.members ?? []), member];
    }
  }

  removeMember(userId: string): void {
    if (userId === this.ownerId) {
      throw new Error('Cannot remove workspace owner');
    }
    this.members = this.members?.filter(m => m.userId !== userId);
  }

  changeMemberRole(userId: string, newRole: WorkspaceMemberRole): void {
    if (userId === this.ownerId && newRole !== WorkspaceMemberRole.OWNER) {
      throw new Error('Cannot change owner\'s role');
    }
    const member = this.members?.find(m => m.userId === userId);
    if (member) {
      member.role = newRole;
    }
  }

  static create(name: string, owner: User): Workspace {
    if (!this.isValidName(name)) {
      throw new Error(`Workspace name "${name}" is invalid`);
    }

    const workspace = new Workspace({
      id: '',
      name: name.trim(),
      ownerId: owner.id,
    });

    workspace.addMember(owner.id, WorkspaceMemberRole.OWNER);
    return workspace;
  }

  private static isValidName(name: string): boolean {
    return name.trim().length >= 3 && name.trim().length <= 50;
  }

  toJSON(): Partial<WorkspaceProps> {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

@Entity('workspace_members')
export class WorkspaceMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: WorkspaceMemberRole,
    default: WorkspaceMemberRole.MEMBER
  })
  role: WorkspaceMemberRole;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
