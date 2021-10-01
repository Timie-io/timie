import { Connection, ViewColumn, ViewEntity } from 'typeorm';
import { Team } from '../teams/team.entity';
import { User } from '../users/user.entity';
import { Project } from './project.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('project.id', 'id')
      .addSelect('project.name', 'name')
      .addSelect('project.description', 'description')
      .addSelect('user.id', 'ownerId')
      .addSelect('user.name', 'ownerName')
      .addSelect('team.id', 'teamId')
      .addSelect('team.name', 'teamName')
      .addSelect('project.creationDate', 'created')
      .addSelect('project.active', 'active')
      .from(Project, 'project')
      .leftJoin(Team, 'team', 'team.id = project.teamId')
      .leftJoin(User, 'user', 'user.id = project.ownerId'),
})
export class ProjectView {
  @ViewColumn()
  id: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  description: string;

  @ViewColumn()
  ownerId: number;

  @ViewColumn()
  ownerName: string;

  @ViewColumn()
  teamId: number;

  @ViewColumn()
  teamName: string;

  @ViewColumn()
  created: Date;

  @ViewColumn()
  active: boolean;
}
