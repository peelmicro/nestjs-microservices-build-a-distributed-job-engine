import { Mutation, Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UpsertUserInput } from './dto/upsert-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async upsertUser(@Args('upsertUserInput') upsertUserInput: UpsertUserInput) {
    return this.usersService.upsertUser(upsertUserInput);
  }

  @Query(() => [User], { name: 'users' })
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Query(() => User, { name: 'user' })
  async getUserById(@Args('id', { type: () => Number }) id: number) {
    return this.usersService.getUserById(id);
  }

  @Query(() => User, { name: 'userByEmail' })
  async getUserByEmail(@Args('email', { type: () => String }) email: string) {
    return this.usersService.getUserByEmail(email);
  }
}
