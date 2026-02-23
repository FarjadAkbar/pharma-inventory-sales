import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../entities/unit.entity';

@Injectable()
export class UnitsService {
  constructor(@InjectRepository(Unit) private unitsRepository: Repository<Unit>) {}

  async create(dto: { code: string; name: string; symbol?: string }) {
    const existing = await this.unitsRepository.findOne({ where: { code: dto.code } });
    if (existing) throw new BadRequestException('Unit with this code already exists');
    const unit = this.unitsRepository.create(dto);
    return this.unitsRepository.save(unit);
  }

  async findAll() {
    return this.unitsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const unit = await this.unitsRepository.findOne({ where: { id } });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async update(id: number, dto: { code?: string; name?: string; symbol?: string }) {
    const unit = await this.unitsRepository.findOne({ where: { id } });
    if (!unit) throw new NotFoundException('Unit not found');
    if (dto.code && dto.code !== unit.code) {
      const existing = await this.unitsRepository.findOne({ where: { code: dto.code } });
      if (existing) throw new BadRequestException('Unit with this code already exists');
    }
    Object.assign(unit, dto);
    return this.unitsRepository.save(unit);
  }

  async delete(id: number) {
    const result = await this.unitsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Unit not found');
  }
}
