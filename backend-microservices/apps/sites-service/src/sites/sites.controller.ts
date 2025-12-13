import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SitesService } from './sites.service';
import { 
  SITE_PATTERNS,
  CreateSiteDto,
  UpdateSiteDto,
} from '@repo/shared';

@Controller()
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @MessagePattern(SITE_PATTERNS.CREATE)
  create(@Payload() createSiteDto: CreateSiteDto) {
    return this.sitesService.create(createSiteDto);
  }

  @MessagePattern(SITE_PATTERNS.LIST)
  findAll() {
    return this.sitesService.findAll();
  }

  @MessagePattern(SITE_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.sitesService.findOne(id);
  }

  @MessagePattern(SITE_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateSiteDto: UpdateSiteDto }) {
    return this.sitesService.update(data.id, data.updateSiteDto);
  }

  @MessagePattern(SITE_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.sitesService.delete(id);
  }
}

