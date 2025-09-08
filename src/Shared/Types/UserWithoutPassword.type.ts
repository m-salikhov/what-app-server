import { User } from 'src/modules/users/entity/user.entity';

export type UserWithoutPassword = Omit<User, 'password'>;
