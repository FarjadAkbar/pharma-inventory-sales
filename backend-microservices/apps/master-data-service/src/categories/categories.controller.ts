import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { CATEGORY_PATTERNS } from '@repo/shared';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @MessagePattern(CATEGORY_PATTERNS.CREATE)
  create(@Payload() dto: { code: string; name: string; description?: string }) {
    return this.categoriesService.create(dto);
  }

  @MessagePattern(CATEGORY_PATTERNS.LIST)
  findAll() {
    return this.categoriesService.findAll();
  }

  @MessagePattern(CATEGORY_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.categoriesService.findOne(id);
  }

  @MessagePattern(CATEGORY_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; code?: string; name?: string; description?: string }) {
    return this.categoriesService.update(data.id, data);
  }

  @MessagePattern(CATEGORY_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.categoriesService.delete(id);
  }
}
