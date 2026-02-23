import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private categoriesRepository: Repository<Category>) {}

  async create(dto: { code: string; name: string; description?: string }) {
    const existing = await this.categoriesRepository.findOne({ where: { code: dto.code } });
    if (existing) throw new BadRequestException('Category with this code already exists');
    const category = this.categoriesRepository.create(dto);
    return this.categoriesRepository.save(category);
  }

  async findAll() {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, dto: { code?: string; name?: string; description?: string }) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    if (dto.code && dto.code !== category.code) {
      const existing = await this.categoriesRepository.findOne({ where: { code: dto.code } });
      if (existing) throw new BadRequestException('Category with this code already exists');
    }
    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async delete(id: number) {
    const result = await this.categoriesRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Category not found');
  }
}
