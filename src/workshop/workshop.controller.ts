import { Controller } from '@nestjs/common';
import { WorkshopService } from './workshop.service';

@Controller('workshop')
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}
}
