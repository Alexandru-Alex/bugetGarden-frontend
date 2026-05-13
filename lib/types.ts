export const PAGE_SIZE = 20;

export interface PlantedFlowerDto {
  name: string;
  imageUrl: string;
  rarity: string;
}

export interface GardenCellDto {
  day: number;
  planted: boolean;
  plantedAt: string | null;
  flower: PlantedFlowerDto | null;
}

export interface GardenDto {
  id: string;
  month: number;
  year: number;
  cells: GardenCellDto[];
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CategoryDto {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  system: boolean;
}
