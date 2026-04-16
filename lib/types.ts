export interface CategoryDto {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  isSystem: boolean;
}
