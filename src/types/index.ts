export interface ProductCategoryDto {
  id?: number;
  name: string;
  imageUrl?: string;
}

export interface ProductDto {
  id?: number;
  name: string;
  description?: string;
  categoryId: number;
  imageUrl?: string;
  price?: number;
}

export interface CustomerDto {
  id?: number;
  name: string;
  email: string;
  phone: string;
  expeditorId?: number;
  creationTime?: string;
}

export interface ExpeditorDto {
  id?: number;
  name: string;
  phone: string;
  creationTime?: string;
}

export interface PriceTypeDto {
  id?: number;
  name: string;
}

export interface PriceDto {
  id?: number;
  productId: number;
  priceType: string;
  price: number;
  validFrom?: string;
  validTo?: string;
  isCurrent?: boolean;
}

export interface PriceItemDto {
  productId: number;
  value: number;
}

export interface BatchPriceRequestDto {
  priceTypeId: number;
  prices: PriceItemDto[];
}

export interface BatchPriceValidationResult {
  valid: boolean;
  errors: string[];
}
