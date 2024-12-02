import {BaseRole} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";


export class TokenDto {
     token: {
        "id": string

        fullName: string

        role: BaseRole[]

        phoneNumber: string;

        "createdDate": string
    }
}