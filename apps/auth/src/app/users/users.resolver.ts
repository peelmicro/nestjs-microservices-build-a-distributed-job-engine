import { Mutation, Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UpsertUserInput } from './dto/upsert-user.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { TokenPayload } from '../auth/token-payload.interface';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async upsertUser(@Args('upsertUserInput') upsertUserInput: UpsertUserInput) {
    return this.usersService.upsertUser(upsertUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'users' })
  async getUsers() {
    return this.usersService.getUsers();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'user' })
  async getUserById(@Args('id', { type: () => Number }) id: number) {
    return this.usersService.getUserById(id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'userByEmail' })
  async getUserByEmail(@Args('email', { type: () => String }) email: string) {
    return this.usersService.getUserByEmail(email);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'getUserFromCookie' })
  async getUserFromCookie(@CurrentUser() { userId }: TokenPayload) {
    return this.usersService.getUserById(userId);
  }
}
