export interface Site {
  id: number
  name: string
  location: string
  created_by: number | null
  updated_by: number | null
  created_at: string
  updated_at: string
}

export interface CreateSiteData {
  name: string
  location: string
}

export interface UpdateSiteData {
  name: string
  location: string
}

export interface SitesResponse {
  status: boolean
  data: Site[]
}

export interface SiteResponse {
  status: boolean
  data: Site
}

export interface SiteActionResponse {
  status: boolean
  message: string
}
