"use client"

import { BaseApiService } from "./base-api.service"
import type { RawMaterialApiResponse, CreateRawMaterialData, UpdateRawMaterialData } from "@/types/raw-materials"

export class RawMaterialsApiService extends BaseApiService {
  async getRawMaterials(): Promise<RawMaterialApiResponse> {
    console.log("API getRawMaterials called at:", new Date().toISOString())
    return this.rawRequest<RawMaterialApiResponse>("/rawmaterial/getAllRawMaterials")
  }

  async getRawMaterial(id: number): Promise<RawMaterialApiResponse> {
    return this.rawRequest<RawMaterialApiResponse>(`/rawmaterial/${id}`)
  }

  async createRawMaterial(data: CreateRawMaterialData): Promise<RawMaterialApiResponse> {
    return this.rawRequest<RawMaterialApiResponse>("/rawmaterial", {
      method: "POST",
      body: JSON.stringify(data)
    })
  }

  async updateRawMaterial(id: number, data: UpdateRawMaterialData): Promise<RawMaterialApiResponse> {
    return this.rawRequest<RawMaterialApiResponse>(`/rawmaterial/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    })
  }

  async deleteRawMaterial(id: number): Promise<RawMaterialApiResponse> {
    return this.rawRequest<RawMaterialApiResponse>(`/rawmaterial/${id}`, {
      method: "DELETE"
    })
  }

  invalidateRawMaterials() {
    this.invalidateCache("raw-materials")
  }
}
