import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../entities/site.entity';
import { 
  CreateSiteDto, 
  UpdateSiteDto, 
  SiteResponseDto,
} from '@repo/shared';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private sitesRepository: Repository<Site>,
  ) {}

  async create(createSiteDto: CreateSiteDto): Promise<SiteResponseDto> {
    const site = this.sitesRepository.create(createSiteDto);
    const saved = await this.sitesRepository.save(site);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<SiteResponseDto[]> {
    const sites = await this.sitesRepository.find({
      order: { createdAt: 'DESC' },
    });
    return sites.map(site => this.toResponseDto(site));
  }

  async findOne(id: number): Promise<SiteResponseDto> {
    const site = await this.sitesRepository.findOne({ where: { id } });
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    return this.toResponseDto(site);
  }

  async update(id: number, updateSiteDto: UpdateSiteDto): Promise<SiteResponseDto> {
    const site = await this.sitesRepository.findOne({ where: { id } });
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    Object.assign(site, updateSiteDto);
    const updated = await this.sitesRepository.save(site);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const site = await this.sitesRepository.findOne({ where: { id } });
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    await this.sitesRepository.remove(site);
  }

  private toResponseDto(site: Site): SiteResponseDto {
    return {
      id: site.id,
      name: site.name,
      address: site.address,
      city: site.city,
      country: site.country,
      type: site.type,
      isActive: site.isActive,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    };
  }
}

