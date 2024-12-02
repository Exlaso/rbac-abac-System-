import {Length, IsPhoneNumber, IsEnum, IsEmpty, IsNotEmpty, IsArray, ArrayMinSize} from 'class-validator';
import {BaseRole} from "@prisma/client";
import {IsString} from "../../../decorators/validator.decorator";
import {ApiProperty} from "@nestjs/swagger";

export class UserSignInCreds {
  @IsString({})
  @IsPhoneNumber("IN")
  phoneNumber: string;


  @IsString({length: {min: 8, max: 30}})
  password: string;
}


export class UserSignUpCreds  {
  @IsString({length: {min: 2, max: 100}})
  fullName:string

  @IsNotEmpty()
  @IsArray()
  @IsEnum(BaseRole,{each:true})
  @ArrayMinSize(1)
  @ApiProperty({enum:BaseRole, isArray:true})
  role:BaseRole[]


  @IsPhoneNumber("IN")
  @IsString({})
  phoneNumber: string;


  @IsString({length:{min:8,max:30}})
  password: string;
}