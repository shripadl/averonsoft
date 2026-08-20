/**
 * Catalog sizes are typical retail footprints (metres).
 * Users should verify against product datasheets before purchase.
 */

export type FurnitureCategory =
  | "seating"
  | "tables"
  | "beds"
  | "storage"
  | "desks"
  | "other";

export type CatalogItem = {
  id: string;
  name: string;
  category: FurnitureCategory;
  /** Width along local X (metres). */
  width: number;
  /** Depth along local Z (metres). */
  depth: number;
  /** Height along Y (metres). */
  height: number;
  color: string;
};

export const FURNITURE_CATALOG: CatalogItem[] = [
  {
    id: "sofa-3",
    name: "3-Seater Sofa",
    category: "seating",
    width: 2.1,
    depth: 0.9,
    height: 0.85,
    color: "#5b6e7a",
  },
  {
    id: "sofa-2",
    name: "2-Seater Sofa",
    category: "seating",
    width: 1.5,
    depth: 0.85,
    height: 0.85,
    color: "#6a7d89",
  },
  {
    id: "armchair",
    name: "Armchair",
    category: "seating",
    width: 0.85,
    depth: 0.85,
    height: 0.9,
    color: "#7a6b5d",
  },
  {
    id: "dining-chair",
    name: "Dining Chair",
    category: "seating",
    width: 0.45,
    depth: 0.5,
    height: 0.95,
    color: "#8b7355",
  },
  {
    id: "coffee-table",
    name: "Coffee Table",
    category: "tables",
    width: 1.1,
    depth: 0.55,
    height: 0.4,
    color: "#a08968",
  },
  {
    id: "dining-table-4",
    name: "Dining Table (4)",
    category: "tables",
    width: 1.2,
    depth: 0.8,
    height: 0.75,
    color: "#9a7b5a",
  },
  {
    id: "dining-table-6",
    name: "Dining Table (6)",
    category: "tables",
    width: 1.8,
    depth: 0.9,
    height: 0.75,
    color: "#8f704f",
  },
  {
    id: "side-table",
    name: "Side Table",
    category: "tables",
    width: 0.45,
    depth: 0.45,
    height: 0.55,
    color: "#b09a78",
  },
  {
    id: "bed-single",
    name: "Single Bed",
    category: "beds",
    width: 0.9,
    depth: 1.9,
    height: 0.55,
    color: "#6d7a8c",
  },
  {
    id: "bed-double",
    name: "Double Bed",
    category: "beds",
    width: 1.35,
    depth: 1.9,
    height: 0.55,
    color: "#5f6c7e",
  },
  {
    id: "bed-king",
    name: "King Bed",
    category: "beds",
    width: 1.5,
    depth: 2.0,
    height: 0.55,
    color: "#546274",
  },
  {
    id: "wardrobe",
    name: "Wardrobe",
    category: "storage",
    width: 1.5,
    depth: 0.6,
    height: 2.1,
    color: "#6b5a4a",
  },
  {
    id: "bookshelf",
    name: "Bookshelf",
    category: "storage",
    width: 0.8,
    depth: 0.3,
    height: 1.8,
    color: "#7a6856",
  },
  {
    id: "tv-unit",
    name: "TV Unit",
    category: "storage",
    width: 1.6,
    depth: 0.4,
    height: 0.5,
    color: "#4a5560",
  },
  {
    id: "chest-drawers",
    name: "Chest of Drawers",
    category: "storage",
    width: 0.9,
    depth: 0.45,
    height: 0.9,
    color: "#7d6a55",
  },
  {
    id: "desk",
    name: "Desk",
    category: "desks",
    width: 1.2,
    depth: 0.6,
    height: 0.75,
    color: "#8a7860",
  },
  {
    id: "office-chair",
    name: "Office Chair",
    category: "desks",
    width: 0.65,
    depth: 0.65,
    height: 1.1,
    color: "#3d4650",
  },
  {
    id: "rug-large",
    name: "Rug (large)",
    category: "other",
    width: 2.0,
    depth: 1.4,
    height: 0.02,
    color: "#c4a882",
  },
  {
    id: "plant-tall",
    name: "Floor Plant",
    category: "other",
    width: 0.4,
    depth: 0.4,
    height: 1.2,
    color: "#3d6b4f",
  },
];

export const CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  seating: "Seating",
  tables: "Tables",
  beds: "Beds",
  storage: "Storage",
  desks: "Desks",
  other: "Other",
};

export function getCatalogItem(id: string): CatalogItem | undefined {
  return FURNITURE_CATALOG.find((item) => item.id === id);
}
