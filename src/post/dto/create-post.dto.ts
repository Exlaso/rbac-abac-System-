import {IsBoolean, IsID, IsString} from "../../../decorators/validator.decorator";
import {TokenDto} from "../../../dto/token.dto";


export class CreatePostDto extends TokenDto {

    @IsString({length: {min: 5, max: 100}})
    title  :      string
    @IsString({length: {min: 10, max: 300}})
    content   :   string

    @IsBoolean({
        ApiPropertyOptions:{title: 'Is Published', example: true}
    })
    isPublished : boolean

}
