import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snapshot } from "./types";

export const STORAGE_KEYS = {
  categories: "BIT240131_DishCategory",
  dishes: "BIT240131_Dish",
  outbox: "BIT240131_SyncQueue",
  language: "BIT240131_Language",
  categoriesResource: "BIT240131_DishCategory",
  dishesResource: "BIT240131_Dish",
} as const;

export async function loadSnapshot(): Promise<Snapshot> {
  const [categoriesRaw, dishesRaw, outboxRaw, languageRaw] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.categories),
    AsyncStorage.getItem(STORAGE_KEYS.dishes),
    AsyncStorage.getItem(STORAGE_KEYS.outbox),
    AsyncStorage.getItem(STORAGE_KEYS.language),
  ]);
  return {
    categories: categoriesRaw ? JSON.parse(categoriesRaw) : [],
    dishes: dishesRaw ? JSON.parse(dishesRaw) : [],
    outbox: outboxRaw ? JSON.parse(outboxRaw) : [],
    language: languageRaw === "vi" ? "vi" : "en",
  };
}

export async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.categories, JSON.stringify(snapshot.categories)],
    [STORAGE_KEYS.dishes, JSON.stringify(snapshot.dishes)],
    [STORAGE_KEYS.outbox, JSON.stringify(snapshot.outbox)],
    [STORAGE_KEYS.language, snapshot.language],
  ]);
}
