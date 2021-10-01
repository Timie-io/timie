import { Connection, ViewColumn, ViewEntity } from 'typeorm';
import { User } from '../users/user.entity';
import { Team } from './team.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('team.id', 'id')
      .addSelect('team.name', 'name')
      .addSelect('team.description', 'description')
      .addSelect('team.ownerId', 'ownerId')
      .addSelect('user.name', 'ownerName')
      .from(Team, 'team')
      .leftJoin(User, 'user', 'user.id = team.ownerId'),
})
export class TeamView {
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
}
