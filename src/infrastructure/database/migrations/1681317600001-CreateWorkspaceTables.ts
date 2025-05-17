import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { WorkspaceMemberRole } from '@domain//models/workspace.model';

export class CreateWorkspaceTables1681317600001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create workspaces table
    await queryRunner.createTable(
      new Table({
        name: 'workspaces',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'owner_id',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create workspace_members table
    await queryRunner.createTable(
      new Table({
        name: 'workspace_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'workspace_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'role',
            type: 'enum',
            enum: Object.values(WorkspaceMemberRole),
            default: `'${WorkspaceMemberRole.MEMBER}'`,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // // Add foreign keys
    // await queryRunner.createForeignKey(
    //   'workspaces',
    //   new TableForeignKey({
    //     columnNames: ['owner_id'],
    //     referencedColumnNames: ['id'],
    //     referencedTableName: 'users',
    //     onDelete: 'CASCADE',
    //   }),
    // );

    // await queryRunner.createForeignKey(
    //   'workspace_members',
    //   new TableForeignKey({
    //     columnNames: ['workspace_id'],
    //     referencedColumnNames: ['id'],
    //     referencedTableName: 'workspaces',
    //     onDelete: 'CASCADE',
    //   }),
    // );

    // await queryRunner.createForeignKey(
    //   'workspace_members',
    //   new TableForeignKey({
    //     columnNames: ['user_id'],
    //     referencedColumnNames: ['id'],
    //     referencedTableName: 'users',
    //     onDelete: 'CASCADE',
    //   }),
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workspace_members');
    await queryRunner.dropTable('workspaces');
  }
}
