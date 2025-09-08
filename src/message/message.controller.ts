import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MessagesService } from './message.service';
import { CreateMessageDto } from './dto/msgdto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import axios from 'axios';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}



  //if (!file.mimetype.match(/\/(jpg|jpeg|png)$/))
  @Post('sendmessage')
    @UseInterceptors(
      FileInterceptor('image', {
        storage: diskStorage({
          destination: './uploads/messages',
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
        fileFilter: (req, file, callback) => {
          if (!file.mimetype.match(/^image\//)) {
            return callback(new Error('Only image files are allowed!'), false);
          }
          callback(null, true);
        },
      }),
    )
  async create(
    @Body() dto: CreateMessageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const imagePath = file ? `/uploads/messages/${file.filename}` : undefined;

      // إنشاء الرسالة
      const message = await this.messagesService.create({ ...dto, image: imagePath});

      // إرسال للـ WebSocket server (اختياري - لا يؤثر على الـ response)
      try {
        await axios.post('http://localhost:3005/api/broadcast', message);
        console.log('📡 Message broadcasted via HTTP');
      } catch (error) {
        console.error('📛 Failed to send message to WebSocket server:', error);
        // لا نرمي error هنا لأن الرسالة تم حفظها بنجاح
      }

      // إرجاع الرسالة المُنشأة (هذا مهم للـ Flutter app)
      return {
        success: true,
        data: message,
        message: 'Message sent successfully'
      };

    } catch (error) {
      console.error('Error creating message:', error);
      
      // إرجاع خطأ واضح
      return {
        success: false,
        message: error.message || 'Failed to send message',
        error: error
      };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMessageDto) {
    return this.messagesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }

  @Get('chat/:chatId')
  findByChatId(@Param('chatId') chatId: string) {
    return this.messagesService.findByChatId(chatId);
  }
}