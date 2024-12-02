import {IsString} from "../../../decorators/validator.decorator";
import {IsOptional} from "class-validator";
import {TokenDto} from "../../../dto/token.dto";


export class UpdateCommentDto extends TokenDto {
    @IsOptional()
    @IsString({length: {max: 100, min: 1}})
    content: string;

}
