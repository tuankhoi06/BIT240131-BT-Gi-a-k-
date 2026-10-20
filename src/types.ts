export type Language = "en" | "vi";
export type StatusFilter = "all" | "available" | "stopped";
export type SortOrder = "none" | "priceAsc" | "priceDesc" | "timeAsc";

export type ImageEntry = {
  BIT240131_ImageUrl: string;
  BIT240131_IsThumbnail: boolean;
};

export type Category = {
  BIT240131_Id: string;
  BIT240131_Name: string;
  BIT240131_Description: string;
  BIT240131_ClientId: string;
  BIT240131_ApiId?: string;
  BIT240131_UpdatedAt: string;
};

export type Dish = {
  BIT240131_Id: string;
  BIT240131_Name: string;
  BIT240131_Price: number;
  BIT240131_PreparationTime: number;
  BIT240131_IsAvailable: boolean;
  BIT240131_Description: string;
  BIT240131_DishCategoryId: string;
  BIT240131_DishImage: ImageEntry[];
  BIT240131_ClientId: string;
  BIT240131_ApiId?: string;
  BIT240131_UpdatedAt: string;
};

export type OutboxOperation = {
  BIT240131_Key: string;
  BIT240131_Entity: "dish" | "category";
  BIT240131_Action: "upsert" | "delete";
  BIT240131_LocalId: string;
  BIT240131_ClientId: string;
  BIT240131_ApiId?: string;
  BIT240131_Payload?: Category | Dish;
};

export type Snapshot = {
  categories: Category[];
  dishes: Dish[];
  outbox: OutboxOperation[];
  language: Language;
};

export type ApiRecord<T extends Category | Dish> = T & { id: string };
