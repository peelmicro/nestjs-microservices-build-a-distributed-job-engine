import { AbstractModel } from '@jobber/graphql';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User extends AbstractModel {
  @Field(() => String)
  email: string;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date)
  createdAt: Date;
}
