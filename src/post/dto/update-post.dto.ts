import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import {ApiProperty} from "@nestjs/swagger";
import {IsBoolean, IsString} from "../../../decorators/validator.decorator";
import {IsOptional} from "class-validator";
import {TokenDto} from "../../../dto/token.dto";

export class UpdatePostDto extends TokenDto{
    @IsOptional()
    @IsString({length: {min: 5, max: 100}})
    title  :      string
    @IsOptional()
    @IsString({length: {min: 10, max: 300}})
    content   :   string
    @IsOptional()
    @IsBoolean({
        ApiPropertyOptions:{title: 'Is Published', example: true}
    })
    isPublished : boolean
}
