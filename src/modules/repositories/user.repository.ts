import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuthProvider } from '../../common/enums';
import { User } from '../../database';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  findById(userId: string): Promise<User | null> {
    return this.findOne({
      where: {
        id: userId,
      },
    });
  }

  findByGoogleProviderAccountIdOrEmail(
    providerAccountId: string,
    email: string,
  ): Promise<User | null> {
    return this.findOne({
      where: [
        {
          provider: AuthProvider.GOOGLE,
          providerAccountId,
        },
        {
          email,
        },
      ],
    });
  }
}
