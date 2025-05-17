import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace, WorkspaceMember } from '@domain/models/workspace.model';

@Injectable()
export class WorkspaceStore {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly memberRepository: Repository<WorkspaceMember>,
  ) {}

  async findById(id: string): Promise<Workspace | null> {
    return this.workspaceRepository.findOne({
      where: { id },
      relations: ['members'],
    });
  }

  async findByUserId(userId: string): Promise<Workspace[]> {
    const memberships = await this.memberRepository.find({
      where: { userId },
      relations: ['workspace', 'workspace.members'],
    });

    return memberships.map(m => m.workspace);
  }

  async save(workspace: Workspace): Promise<Workspace> {
    return this.workspaceRepository.save(workspace);
  }
}
