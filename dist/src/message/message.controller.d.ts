import { MessagesService } from './message.service';
import { CreateMessageDto } from './dto/msgdto';
import { UpdateMessageDto } from './dto/update-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(dto: CreateMessageDto, file: Express.Multer.File): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./message.schema").MessageDocument, {}, {}> & import("./message.schema").Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./message.schema").MessageDocument, {}, {}> & import("./message.schema").Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateMessageDto): Promise<import("mongoose").Document<unknown, {}, import("./message.schema").MessageDocument, {}, {}> & import("./message.schema").Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("./message.schema").MessageDocument, {}, {}> & import("./message.schema").Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findByChatId(chatId: string): Promise<(import("mongoose").Document<unknown, {}, import("./message.schema").MessageDocument, {}, {}> & import("./message.schema").Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
}
