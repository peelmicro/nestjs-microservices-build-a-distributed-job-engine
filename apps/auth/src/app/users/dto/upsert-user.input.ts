import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsOptional, IsStrongPassword } from "class-validator";

@InputType()
export class UpsertUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsStrongPassword()
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsStrongPassword()
  newPassword?: string;
}
