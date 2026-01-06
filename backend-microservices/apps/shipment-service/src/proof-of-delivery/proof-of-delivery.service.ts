import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProofOfDelivery } from '../entities/proof-of-delivery.entity';
import { Shipment } from '../entities/shipment.entity';
import { ShipmentsService } from '../shipments/shipments.service';

@Injectable()
export class ProofOfDeliveryService {
  constructor(
    @InjectRepository(ProofOfDelivery)
    private podRepository: Repository<ProofOfDelivery>,
    @InjectRepository(Shipment)
    private shipmentsRepository: Repository<Shipment>,
  ) {}

  async create(data: {
    shipmentId: number;
    salesOrderId: number;
    salesOrderNumber: string;
    deliveryDate: string;
    deliveredBy: string;
    receivedBy: string;
    receivedBySignature?: string;
    deliveryConditions?: any;
    itemsReceived?: any[];
    remarks?: string;
  }): Promise<any> {
    const shipment = await this.shipmentsRepository.findOne({
      where: { id: data.shipmentId },
      relations: ['items'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${data.shipmentId} not found`);
    }

    if (shipment.status !== 'Shipped' && shipment.status !== 'In Transit') {
      throw new BadRequestException(`Cannot create POD. Shipment status: ${shipment.status}`);
    }

    // Generate POD number using a helper method
    const podNumber = await this.generatePODNumber();

    const pod = this.podRepository.create({
      podNumber,
      shipmentId: data.shipmentId,
      salesOrderId: data.salesOrderId,
      salesOrderNumber: data.salesOrderNumber,
      deliveryDate: new Date(data.deliveryDate),
      deliveredBy: data.deliveredBy,
      receivedBy: data.receivedBy,
      receivedBySignature: data.receivedBySignature,
      deliveryConditions: data.deliveryConditions,
      itemsReceived: data.itemsReceived,
      status: 'Pending',
      remarks: data.remarks,
    });

    const saved = await this.podRepository.save(pod);
    return this.toResponseDto(saved);
  }

  async complete(id: number, completedBy: number): Promise<any> {
    const pod = await this.podRepository.findOne({
      where: { id },
      relations: ['shipment'],
    });

    if (!pod) {
      throw new NotFoundException(`POD with ID ${id} not found`);
    }

    if (pod.status === 'Completed') {
      throw new BadRequestException('POD is already completed');
    }

    pod.status = 'Completed';
    pod.completedBy = completedBy;
    pod.completedAt = new Date();

    const updated = await this.podRepository.save(pod);

    // Update shipment status to DELIVERED
    if (pod.shipment) {
      pod.shipment.status = 'Delivered' as any;
      pod.shipment.actualDeliveryDate = new Date();
      await this.shipmentsRepository.save(pod.shipment);
    }

    return this.toResponseDto(updated);
  }

  async findAll(params?: {
    shipmentId?: number;
    salesOrderId?: number;
    status?: string;
  }): Promise<any[]> {
    const where: any = {};
    if (params?.shipmentId) where.shipmentId = params.shipmentId;
    if (params?.salesOrderId) where.salesOrderId = params.salesOrderId;
    if (params?.status) where.status = params.status;

    const pods = await this.podRepository.find({
      where,
      relations: ['shipment'],
      order: { createdAt: 'DESC' },
    });

    return pods.map(pod => this.toResponseDto(pod));
  }

  async findOne(id: number): Promise<any> {
    const pod = await this.podRepository.findOne({
      where: { id },
      relations: ['shipment'],
    });

    if (!pod) {
      throw new NotFoundException(`POD with ID ${id} not found`);
    }

    return this.toResponseDto(pod);
  }

  async getByShipment(shipmentId: number): Promise<any[]> {
    const pods = await this.podRepository.find({
      where: { shipmentId },
      relations: ['shipment'],
      order: { createdAt: 'DESC' },
    });

    return pods.map(pod => this.toResponseDto(pod));
  }

  private async generatePODNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `POD-${year}-`;
    
    const lastPOD = await this.podRepository
      .createQueryBuilder('pod')
      .where('pod.podNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('pod.podNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastPOD) {
      const lastSequence = parseInt(lastPOD.podNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  private toResponseDto(pod: ProofOfDelivery): any {
    return {
      id: pod.id,
      podNumber: pod.podNumber,
      shipmentId: pod.shipmentId,
      salesOrderId: pod.salesOrderId,
      salesOrderNumber: pod.salesOrderNumber,
      deliveryDate: pod.deliveryDate,
      actualDeliveryDate: pod.actualDeliveryDate,
      deliveredBy: pod.deliveredBy,
      receivedBy: pod.receivedBy,
      receivedBySignature: pod.receivedBySignature,
      deliveryConditions: pod.deliveryConditions,
      itemsReceived: pod.itemsReceived,
      status: pod.status,
      rejectedReason: pod.rejectedReason,
      completedBy: pod.completedBy,
      completedByName: pod.completedByName,
      completedAt: pod.completedAt,
      remarks: pod.remarks,
      createdAt: pod.createdAt,
      updatedAt: pod.updatedAt,
    };
  }
}

