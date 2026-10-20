import { Category, Dish } from "./types";

const updatedAt = "2026-10-20T00:00:00.000Z";

export const SEED_CATEGORIES: Category[] = [
  {
    BIT240131_Id: "category-main",
    BIT240131_Name: "Main course",
    BIT240131_Description: "Filling meals and signature dishes.",
    BIT240131_ClientId: "seed-category-main",
    BIT240131_UpdatedAt: updatedAt,
  },
  {
    BIT240131_Id: "category-soup",
    BIT240131_Name: "Soup",
    BIT240131_Description: "Warm soups and broths.",
    BIT240131_ClientId: "seed-category-soup",
    BIT240131_UpdatedAt: updatedAt,
  },
  {
    BIT240131_Id: "category-dessert",
    BIT240131_Name: "Dessert",
    BIT240131_Description: "Sweet treats and desserts.",
    BIT240131_ClientId: "seed-category-dessert",
    BIT240131_UpdatedAt: updatedAt,
  },
];

export const SEED_DISHES: Dish[] = [
  {
    BIT240131_Id: "dish-pho",
    BIT240131_Name: "Beef Pho",
    BIT240131_Price: 65000,
    BIT240131_PreparationTime: 20,
    BIT240131_IsAvailable: true,
    BIT240131_Description: "Traditional beef noodle soup with fresh herbs.",
    BIT240131_DishCategoryId: "category-soup",
    BIT240131_DishImage: [
      {
        BIT240131_ImageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800",
        BIT240131_IsThumbnail: true,
      },
      {
        BIT240131_ImageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
        BIT240131_IsThumbnail: false,
      },
    ],
    BIT240131_ClientId: "seed-dish-pho",
    BIT240131_UpdatedAt: updatedAt,
  },
  {
    BIT240131_Id: "dish-banh-mi",
    BIT240131_Name: "Banh Mi",
    BIT240131_Price: 30000,
    BIT240131_PreparationTime: 10,
    BIT240131_IsAvailable: true,
    BIT240131_Description: "Crispy baguette with savory Vietnamese fillings.",
    BIT240131_DishCategoryId: "category-main",
    BIT240131_DishImage: [
      {
        BIT240131_ImageUrl: "https://images.unsplash.com/photo-1600454309261-3dc9b7597637?w=800",
        BIT240131_IsThumbnail: true,
      },
    ],
    BIT240131_ClientId: "seed-dish-banh-mi",
    BIT240131_UpdatedAt: updatedAt,
  },
  {
    BIT240131_Id: "dish-spring-rolls",
    BIT240131_Name: "Fresh Spring Rolls",
    BIT240131_Price: 45000,
    BIT240131_PreparationTime: 12,
    BIT240131_IsAvailable: true,
    BIT240131_Description: "Fresh rolls with shrimp, herbs and dipping sauce.",
    BIT240131_DishCategoryId: "category-main",
    BIT240131_DishImage: [
      {
        BIT240131_ImageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
        BIT240131_IsThumbnail: true,
      },
    ],
    BIT240131_ClientId: "seed-dish-spring-rolls",
    BIT240131_UpdatedAt: updatedAt,
  },
  {
    BIT240131_Id: "dish-caramel",
    BIT240131_Name: "Vietnamese Caramel Flan",
    BIT240131_Price: 25000,
    BIT240131_PreparationTime: 8,
    BIT240131_IsAvailable: true,
    BIT240131_Description: "Silky custard with a light caramel topping.",
    BIT240131_DishCategoryId: "category-dessert",
    BIT240131_DishImage: [
      {
        BIT240131_ImageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
        BIT240131_IsThumbnail: true,
      },
    ],
    BIT240131_ClientId: "seed-dish-caramel",
    BIT240131_UpdatedAt: updatedAt,
  },
  {
    BIT240131_Id: "dish-bun-cha",
    BIT240131_Name: "Bun Cha",
    BIT240131_Price: 55000,
    BIT240131_PreparationTime: 25,
    BIT240131_IsAvailable: false,
    BIT240131_Description: "Grilled pork with vermicelli and dipping broth.",
    BIT240131_DishCategoryId: "category-main",
    BIT240131_DishImage: [],
    BIT240131_ClientId: "seed-dish-bun-cha",
    BIT240131_UpdatedAt: updatedAt,
  },
];
