import {TokenDto} from "../../../dto/token.dto";
import {IsID, IsString} from "../../../decorators/validator.decorator";

export class CreateCommentDto extends TokenDto {
    @IsString({length: {max: 100, min: 1}})
    content: string;
    @IsID({idName: "post"})
    postId: string;
}
