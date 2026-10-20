import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ApiRecord,
  Category,
  Dish,
  ImageEntry,
  Language,
  OutboxOperation,
  Snapshot,
  SortOrder,
  StatusFilter,
} from "./src/types";
import { SEED_CATEGORIES, SEED_DISHES } from "./src/seed";
import { copy } from "./src/strings";
import {
  apiConfigured,
  deleteRecord,
  fetchRecords,
  findByClientId,
  saveRecord,
} from "./src/mockApi";
import {
  loadSnapshot,
  saveSnapshot,
  STORAGE_KEYS,
} from "./src/storage";

type Screen =
  | { name: "list" }
  | { name: "detail"; dishId: string }
  | { name: "form"; dishId?: string };

type Filters = {
  search: string;
  categoryId: string;
  status: StatusFilter;
  minPrice: string;
  maxPrice: string;
  sort: SortOrder;
};

const EMPTY_FILTERS: Filters = {
  search: "",
  categoryId: "",
  status: "all",
  minPrice: "",
  maxPrice: "",
  sort: "none",
};

const BRAND = "#6654d9";
const INK = "#20243a";
const MUTED = "#72788d";
const SURFACE = "#ffffff";
const BACKGROUND = "#f5f6fb";

const VI_SAMPLE_CATEGORIES: Record<string, string> = {
  "category-main": "Món chính",
  "category-soup": "Món nước",
  "category-dessert": "Tráng miệng",
};

const VI_SAMPLE_DISHES: Record<string, { name: string; description: string }> = {
  "dish-pho": {
    name: "Phở bò",
    description: "Phở bò truyền thống dùng kèm rau thơm tươi.",
  },
  "dish-banh-mi": {
    name: "Bánh mì",
    description: "Bánh mì giòn với nhân Việt Nam đậm đà.",
  },
  "dish-spring-rolls": {
    name: "Gỏi cuốn",
    description: "Gỏi cuốn tôm, rau thơm và nước chấm.",
  },
  "dish-caramel": {
    name: "Bánh flan caramel",
    description: "Bánh flan mềm mịn phủ lớp caramel thơm ngọt.",
  },
  "dish-bun-cha": {
    name: "Bún chả",
    description: "Thịt nướng ăn cùng bún và nước chấm.",
  },
};

function displayCategoryName(
  category: Category | undefined,
  language: Language,
): string {
  if (!category) {
    return copy[language].unknownCategory;
  }
  return language === "vi"
    ? VI_SAMPLE_CATEGORIES[category.BIT240131_Id] ?? category.BIT240131_Name
    : category.BIT240131_Name;
}

function displayDishName(dish: Dish, language: Language): string {
  return language === "vi"
    ? VI_SAMPLE_DISHES[dish.BIT240131_Id]?.name ?? dish.BIT240131_Name
    : dish.BIT240131_Name;
}

function displayDishDescription(dish: Dish, language: Language): string {
  return language === "vi"
    ? VI_SAMPLE_DISHES[dish.BIT240131_Id]?.description ??
        dish.BIT240131_Description
    : dish.BIT240131_Description;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeOperation(
  entity: OutboxOperation["BIT240131_Entity"],
  action: OutboxOperation["BIT240131_Action"],
  localId: string,
  clientId: string,
  apiId?: string,
  payload?: Category | Dish,
): OutboxOperation {
  return {
    BIT240131_Key: `${entity}:${localId}`,
    BIT240131_Entity: entity,
    BIT240131_Action: action,
    BIT240131_LocalId: localId,
    BIT240131_ClientId: clientId,
    BIT240131_ApiId: apiId,
    BIT240131_Payload: payload,
  };
}

function queueOperation(
  queue: OutboxOperation[],
  operation: OutboxOperation,
): OutboxOperation[] {
  return [
    ...queue.filter(
      (entry) => entry.BIT240131_Key !== operation.BIT240131_Key,
    ),
    operation,
  ];
}

function toCategory(record: ApiRecord<Category>): Category {
  return {
    BIT240131_Id: record.BIT240131_Id,
    BIT240131_Name: record.BIT240131_Name,
    BIT240131_Description: record.BIT240131_Description,
    BIT240131_ClientId: record.BIT240131_ClientId,
    BIT240131_ApiId: record.id,
    BIT240131_UpdatedAt: record.BIT240131_UpdatedAt,
  };
}

function toDish(record: ApiRecord<Dish>): Dish {
  return {
    BIT240131_Id: record.BIT240131_Id,
    BIT240131_Name: record.BIT240131_Name,
    BIT240131_Price: Number(record.BIT240131_Price),
    BIT240131_PreparationTime: Number(record.BIT240131_PreparationTime),
    BIT240131_IsAvailable: Boolean(record.BIT240131_IsAvailable),
    BIT240131_Description: record.BIT240131_Description,
    BIT240131_DishCategoryId: record.BIT240131_DishCategoryId,
    BIT240131_DishImage: record.BIT240131_DishImage ?? [],
    BIT240131_ClientId: record.BIT240131_ClientId,
    BIT240131_ApiId: record.id,
    BIT240131_UpdatedAt: record.BIT240131_UpdatedAt,
  };
}

function AppButton({
  label,
  onPress,
  kind = "primary",
  compact = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  kind?: "primary" | "secondary" | "danger" | "quiet";
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        styles[`button_${kind}`],
        compact && styles.buttonCompact,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          kind !== "primary" && styles[`buttonText_${kind}`],
          compact && styles.buttonTextCompact,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a1a5b4"
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
      />
    </View>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    categories: [],
    dishes: [],
    outbox: [],
    language: "en",
  });
  const snapshotRef = useRef(snapshot);
  const [screen, setScreen] = useState<Screen>({ name: "list" });
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [online, setOnline] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [syncError, setSyncError] = useState("");
  const [syncRevision, setSyncRevision] = useState(0);
  const syncLock = useRef(false);
  const t = copy[snapshot.language];

  const commit = useCallback(async (next: Snapshot) => {
    await saveSnapshot(next);
    snapshotRef.current = next;
    setSnapshot(next);
  }, []);

  const runSync = useCallback(async () => {
    if (
      syncLock.current ||
      !apiConfigured() ||
      online === false ||
      loading
    ) {
      return;
    }
    syncLock.current = true;
    setBusy(true);
    setSyncError("");
    try {
      const operations = [...snapshotRef.current.outbox];
      for (const operation of operations) {
        const collection =
          operation.BIT240131_Entity === "dish"
            ? STORAGE_KEYS.dishesResource
            : STORAGE_KEYS.categoriesResource;
        const current = snapshotRef.current;
        const localList =
          operation.BIT240131_Entity === "dish"
            ? current.dishes
            : current.categories;
        const localItem = localList.find(
          (item) => item.BIT240131_Id === operation.BIT240131_LocalId,
        );

        if (operation.BIT240131_Action === "delete") {
          const remote =
            operation.BIT240131_ApiId === undefined
              ? await findByClientId(
                  collection,
                  operation.BIT240131_ClientId,
                )
              : { id: operation.BIT240131_ApiId };
          if (remote) {
            await deleteRecord(collection, remote.id);
          }
        } else if (localItem) {
          const existing = await findByClientId(
            collection,
            operation.BIT240131_ClientId,
          );
          const saved = await saveRecord(
            collection,
            existing?.id ?? operation.BIT240131_ApiId,
            localItem,
          );
          const latest = snapshotRef.current;
          const latestList =
            operation.BIT240131_Entity === "dish"
              ? latest.dishes
              : latest.categories;
          const updatedList = latestList.map((item) =>
            item.BIT240131_Id === operation.BIT240131_LocalId
              ? {
                  ...item,
                  BIT240131_ApiId: saved.id,
                }
              : item,
          );
          await commit(
            operation.BIT240131_Entity === "dish"
              ? { ...latest, dishes: updatedList as Dish[] }
              : { ...latest, categories: updatedList as Category[] },
          );
        }

        const latest = snapshotRef.current;
        await commit({
          ...latest,
          outbox: latest.outbox.filter(
            (entry) =>
              entry.BIT240131_Key !== operation.BIT240131_Key ||
              entry !== operation,
          ),
        });
      }

      const [remoteCategories, remoteDishes] = await Promise.all([
        fetchRecords<Category>(STORAGE_KEYS.categoriesResource),
        fetchRecords<Dish>(STORAGE_KEYS.dishesResource),
      ]);
      const latest = snapshotRef.current;
      const dirtyKeys = new Set(
        latest.outbox.map((item) => `${item.BIT240131_Entity}:${item.BIT240131_ClientId}`),
      );
      const mergedCategories = mergeRemote(
        latest.categories,
        remoteCategories.map(toCategory),
        "category",
        dirtyKeys,
      );
      const mergedDishes = mergeRemote(
        latest.dishes,
        remoteDishes.map(toDish),
        "dish",
        dirtyKeys,
      );
      await commit({
        ...latest,
        categories: mergedCategories,
        dishes: mergedDishes,
      });
      if (snapshotRef.current.outbox.length > 0) {
        setSyncRevision((revision) => revision + 1);
      }
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "MockAPI synchronization failed.",
      );
    } finally {
      syncLock.current = false;
      setBusy(false);
    }
  }, [commit, loading, online]);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        const saved = await loadSnapshot();
        const isFirstRun = saved.categories.length === 0;
        const initial: Snapshot = isFirstRun
          ? {
              ...saved,
              categories: SEED_CATEGORIES,
              dishes: SEED_DISHES,
              outbox: [
                ...SEED_CATEGORIES.map((category) =>
                  makeOperation(
                    "category",
                    "upsert",
                    category.BIT240131_Id,
                    category.BIT240131_ClientId,
                    undefined,
                    category,
                  ),
                ),
                ...SEED_DISHES.map((dish) =>
                  makeOperation(
                    "dish",
                    "upsert",
                    dish.BIT240131_Id,
                    dish.BIT240131_ClientId,
                    undefined,
                    dish,
                  ),
                ),
              ],
            }
          : saved;
        await saveSnapshot(initial);
        if (mounted) {
          snapshotRef.current = initial;
          setSnapshot(initial);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setNotice(
            error instanceof Error
              ? `${copy[snapshotRef.current.language].storageError}: ${error.message}`
              : copy[snapshotRef.current.language].storageError,
          );
          setLoading(false);
        }
      }
    };
    void initialize();
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (online === true && !loading) {
      void runSync();
    }
  }, [loading, online, runSync, snapshot.outbox.length, syncRevision]);

  const filteredDishes = useMemo(() => {
    const search = filters.search.trim().toLocaleLowerCase();
    const min = filters.minPrice.trim() === "" ? undefined : Number(filters.minPrice);
    const max = filters.maxPrice.trim() === "" ? undefined : Number(filters.maxPrice);
    const invalidPriceRange =
      (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
      (max !== undefined && (!Number.isFinite(max) || max < 0)) ||
      (min !== undefined && max !== undefined && min > max);
    if (invalidPriceRange) {
      return [];
    }
    return snapshot.dishes
      .filter((dish) => {
        if (
          search &&
          !dish.BIT240131_Name.toLocaleLowerCase().includes(search) &&
          !displayDishName(dish, snapshot.language)
            .toLocaleLowerCase()
            .includes(search)
        ) {
          return false;
        }
        if (
          filters.categoryId &&
          dish.BIT240131_DishCategoryId !== filters.categoryId
        ) {
          return false;
        }
        if (filters.status === "available" && !dish.BIT240131_IsAvailable) {
          return false;
        }
        if (filters.status === "stopped" && dish.BIT240131_IsAvailable) {
          return false;
        }
        if (min !== undefined && dish.BIT240131_Price < min) {
          return false;
        }
        if (max !== undefined && dish.BIT240131_Price > max) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === "priceAsc") {
          return a.BIT240131_Price - b.BIT240131_Price;
        }
        if (filters.sort === "priceDesc") {
          return b.BIT240131_Price - a.BIT240131_Price;
        }
        if (filters.sort === "timeAsc") {
          return (
            a.BIT240131_PreparationTime - b.BIT240131_PreparationTime
          );
        }
        return 0;
      });
  }, [filters, snapshot.dishes, snapshot.language]);

  const updateDish = useCallback(
    async (dish: Dish) => {
      const nextDish = { ...dish, BIT240131_UpdatedAt: new Date().toISOString() };
      const current = snapshotRef.current;
      const exists = current.dishes.some(
        (item) => item.BIT240131_Id === nextDish.BIT240131_Id,
      );
      const next: Snapshot = {
        ...current,
        dishes: exists
          ? current.dishes.map((item) =>
              item.BIT240131_Id === nextDish.BIT240131_Id ? nextDish : item,
            )
          : [nextDish, ...current.dishes],
        outbox: queueOperation(
          current.outbox,
          makeOperation(
            "dish",
            "upsert",
            nextDish.BIT240131_Id,
            nextDish.BIT240131_ClientId,
            nextDish.BIT240131_ApiId,
            nextDish,
          ),
        ),
      };
      try {
        await commit(next);
        setNotice("");
      } catch (error) {
        setNotice(
          error instanceof Error
            ? `${t.storageError}: ${error.message}`
            : t.storageError,
        );
      }
    },
    [commit, t.storageError],
  );

  const removeDish = useCallback(
    async (dish: Dish) => {
      const current = snapshotRef.current;
      const next: Snapshot = {
        ...current,
        dishes: current.dishes.filter(
          (item) => item.BIT240131_Id !== dish.BIT240131_Id,
        ),
        outbox: queueOperation(
          current.outbox,
          makeOperation(
            "dish",
            "delete",
            dish.BIT240131_Id,
            dish.BIT240131_ClientId,
            dish.BIT240131_ApiId,
          ),
        ),
      };
      try {
        await commit(next);
        setScreen({ name: "list" });
      } catch (error) {
        setNotice(
          error instanceof Error
            ? `${t.storageError}: ${error.message}`
            : t.storageError,
        );
      }
    },
    [commit, t.storageError],
  );

  const toggleLanguage = async () => {
    const language: Language = snapshot.language === "en" ? "vi" : "en";
    try {
      await commit({ ...snapshotRef.current, language });
    } catch (error) {
      setNotice(
        error instanceof Error
          ? `${t.storageError}: ${error.message}`
          : t.storageError,
      );
    }
  };

  const deleteConfirmation = (dish: Dish) => {
    Alert.alert(t.deleteTitle, t.deleteConfirm(displayDishName(dish, snapshot.language)), [
      { text: t.cancel, style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: () => void removeDish(dish),
      },
    ]);
  };

  const selectedDish =
    screen.name === "detail" || screen.name === "form"
      ? snapshot.dishes.find((dish) => dish.BIT240131_Id === screen.dishId)
      : undefined;

  const categoryName = (id: string) =>
    displayCategoryName(
      snapshot.categories.find((category) => category.BIT240131_Id === id),
      snapshot.language,
    );

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const showForm = (dish?: Dish) =>
    setScreen(
      dish
        ? { name: "form", dishId: dish.BIT240131_Id }
        : { name: "form" },
    );

  const connectionLabel =
    online === null
      ? t.checking
      : online
        ? busy
          ? t.syncing
          : t.online
        : t.offline;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandKicker}>BIT240131_FoodManager</Text>
          <Text style={styles.brandTitle}>{t.appTitle}</Text>
          <Text style={styles.studentName}>Nguyễn Trần Tuấn Khôi</Text>
        </View>
        <AppButton
          compact
          kind="secondary"
          label={snapshot.language === "en" ? "VI" : "EN"}
          onPress={() => void toggleLanguage()}
        />
      </View>

      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <View
            style={[
              styles.statusDot,
              online ? styles.statusDotOnline : styles.statusDotOffline,
            ]}
          />
          <Text style={styles.statusText}>{connectionLabel}</Text>
          {snapshot.outbox.length > 0 && (
            <Text style={styles.pendingText}>
              {t.pending(snapshot.outbox.length)}
            </Text>
          )}
        </View>
        {!apiConfigured() && (
          <Text style={styles.configHint}>{t.apiNotConfigured}</Text>
        )}
      </View>

      {notice !== "" && (
        <Text accessibilityRole="alert" style={styles.errorBanner}>
          {notice}
        </Text>
      )}
      {syncError !== "" && (
        <Text accessibilityRole="alert" style={styles.errorBanner}>
          {t.syncError}: {syncError}
        </Text>
      )}

      {loading ? (
        <View style={styles.centered}>
          <Text style={styles.mutedText}>{t.loading}</Text>
        </View>
      ) : screen.name === "form" ? (
        <DishForm
          key={screen.dishId ?? "new"}
          dish={selectedDish}
          categories={snapshot.categories}
          dishes={snapshot.dishes}
          language={snapshot.language}
          onCancel={() => setScreen({ name: "list" })}
          onSave={(dish) => {
            void updateDish(dish);
            setScreen({ name: "list" });
          }}
        />
      ) : screen.name === "detail" ? (
        selectedDish ? (
          <DishDetail
            dish={selectedDish}
            category={categoryName(selectedDish.BIT240131_DishCategoryId)}
            language={snapshot.language}
            onBack={() => setScreen({ name: "list" })}
            onEdit={() => showForm(selectedDish)}
            onDelete={() => deleteConfirmation(selectedDish)}
            onSetThumbnail={(index) => {
              const images = selectedDish.BIT240131_DishImage.map(
                (image, imageIndex) => ({
                  ...image,
                  BIT240131_IsThumbnail: imageIndex === index,
                }),
              );
              void updateDish({
                ...selectedDish,
                BIT240131_DishImage: images,
              });
            }}
          />
        ) : (
          <EmptyState
            message={t.notFound}
            action={t.back}
            onAction={() => setScreen({ name: "list" })}
          />
        )
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={filteredDishes}
          keyExtractor={(item) => item.BIT240131_Id}
          ListHeaderComponent={
            <View>
              <View style={styles.heroCard}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>{t.collection}</Text>
                  <Text style={styles.heroTitle}>{t.manageDishes}</Text>
                  <Text style={styles.heroSubtitle}>
                    {t.catalogCount(snapshot.dishes.length)}
                  </Text>
                </View>
                <Text style={styles.heroIcon}>🍽️</Text>
              </View>
              <AppButton
                label={`＋  ${t.addDish}`}
                onPress={() => showForm()}
              />
              <FilterPanel
                categories={snapshot.categories}
                filters={filters}
                language={snapshot.language}
                onChange={setFilter}
                onClear={() => setFilters(EMPTY_FILTERS)}
              />
              <View style={styles.resultHeader}>
                <Text style={styles.sectionTitle}>{t.dishList}</Text>
                <Text style={styles.resultCount}>
                  {t.results(filteredDishes.length)}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              message={t.noDishes}
              action={t.clearFilters}
              onAction={() => setFilters(EMPTY_FILTERS)}
            />
          }
          renderItem={({ item }) => (
            <DishCard
              dish={item}
              category={categoryName(item.BIT240131_DishCategoryId)}
              language={snapshot.language}
              onPress={() =>
                setScreen({ name: "detail", dishId: item.BIT240131_Id })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function mergeRemote<T extends Category | Dish>(
  local: T[],
  remote: T[],
  entity: "category" | "dish",
  dirtyKeys: Set<string>,
): T[] {
  const result = new Map<string, T>();
  for (const item of local) {
    result.set(item.BIT240131_ClientId, item);
  }
  for (const remoteItem of remote) {
    const key = `${entity}:${remoteItem.BIT240131_ClientId}`;
    if (dirtyKeys.has(key)) {
      continue;
    }
    const localItem = result.get(remoteItem.BIT240131_ClientId);
    result.set(
      remoteItem.BIT240131_ClientId,
      localItem
        ? ({ ...localItem, ...remoteItem, BIT240131_Id: localItem.BIT240131_Id } as T)
        : remoteItem,
    );
  }
  return Array.from(result.values());
}

function FilterPanel({
  categories,
  filters,
  language,
  onChange,
  onClear,
}: {
  categories: Category[];
  filters: Filters;
  language: Language;
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClear: () => void;
}) {
  const t = copy[language];
  const min = filters.minPrice.trim() === "" ? undefined : Number(filters.minPrice);
  const max = filters.maxPrice.trim() === "" ? undefined : Number(filters.maxPrice);
  const invalidRange =
    (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
    (max !== undefined && (!Number.isFinite(max) || max < 0)) ||
    (min !== undefined && max !== undefined && min > max);

  return (
    <View style={styles.filterCard}>
      <View style={styles.panelHeading}>
        <Text style={styles.panelTitle}>{t.filters}</Text>
        <Pressable onPress={onClear}>
          <Text style={styles.clearText}>{t.clear}</Text>
        </Pressable>
      </View>
      <Field
        label={t.search}
        placeholder={t.searchPlaceholder}
        value={filters.search}
        onChangeText={(value) => onChange("search", value)}
      />
      <Text style={styles.fieldLabel}>{t.category}</Text>
      <View style={styles.chipRow}>
        <ChoiceChip
          label={t.all}
          selected={filters.categoryId === ""}
          onPress={() => onChange("categoryId", "")}
        />
        {categories.map((category) => (
          <ChoiceChip
            key={category.BIT240131_Id}
            label={displayCategoryName(category, language)}
            selected={filters.categoryId === category.BIT240131_Id}
            onPress={() =>
              onChange("categoryId", category.BIT240131_Id)
            }
          />
        ))}
      </View>
      <Text style={styles.fieldLabel}>{t.status}</Text>
      <View style={styles.chipRow}>
        {(["all", "available", "stopped"] as StatusFilter[]).map((status) => (
          <ChoiceChip
            key={status}
            label={t.statusOptions[status]}
            selected={filters.status === status}
            onPress={() => onChange("status", status)}
          />
        ))}
      </View>
      <Text style={styles.fieldLabel}>{t.priceRange}</Text>
      <View style={styles.priceInputs}>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={(value) => onChange("minPrice", value)}
          placeholder={t.minimum}
          style={styles.input}
          value={filters.minPrice}
        />
        <Text style={styles.rangeSeparator}>—</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={(value) => onChange("maxPrice", value)}
          placeholder={t.maximum}
          style={styles.input}
          value={filters.maxPrice}
        />
      </View>
      {invalidRange && <Text style={styles.validationText}>{t.invalidRange}</Text>}
      <Text style={styles.fieldLabel}>{t.sortBy}</Text>
      <View style={styles.chipRow}>
        {(["none", "priceAsc", "priceDesc", "timeAsc"] as SortOrder[]).map(
          (sort) => (
            <ChoiceChip
              key={sort}
              label={t.sortOptions[sort]}
              selected={filters.sort === sort}
              onPress={() => onChange("sort", sort)}
            />
          ),
        )}
      </View>
    </View>
  );
}

function DishCard({
  dish,
  category,
  language,
  onPress,
}: {
  dish: Dish;
  category: string;
  language: Language;
  onPress: () => void;
}) {
  const t = copy[language];
  const thumbnail = dish.BIT240131_DishImage.find(
    (image) => image.BIT240131_IsThumbnail,
  );
  return (
    <Pressable onPress={onPress} style={styles.dishCard}>
      <View style={styles.cardImageWrap}>
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail.BIT240131_ImageUrl }}
            style={styles.cardImage}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderEmoji}>🥘</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTopLine}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {displayDishName(dish, language)}
          </Text>
          <Text style={styles.priceText}>
            {dish.BIT240131_Price.toLocaleString()}₫
          </Text>
        </View>
        <Text style={styles.cardCategory}>{category}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>
            {dish.BIT240131_PreparationTime} {t.minutes}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>
            {dish.BIT240131_PreparationTime <= 15 ? t.quick : t.regular}
          </Text>
          <View
            style={[
              styles.availabilityBadge,
              dish.BIT240131_IsAvailable
                ? styles.availableBadge
                : styles.stoppedBadge,
            ]}
          >
            <Text
              style={[
                styles.availabilityText,
                dish.BIT240131_IsAvailable
                  ? styles.availableText
                  : styles.stoppedText,
              ]}
            >
              {dish.BIT240131_IsAvailable ? t.available : t.stopped}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function DishDetail({
  dish,
  category,
  language,
  onBack,
  onEdit,
  onDelete,
  onSetThumbnail,
}: {
  dish: Dish;
  category: string;
  language: Language;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetThumbnail: (index: number) => void;
}) {
  const t = copy[language];
  return (
    <ScrollView contentContainerStyle={styles.pageContent}>
      <AppButton kind="quiet" label={`‹  ${t.back}`} onPress={onBack} />
      <View style={styles.detailHeader}>
        <View style={styles.detailTitleRow}>
          <Text style={styles.pageTitle}>{displayDishName(dish, language)}</Text>
          <View
            style={[
              styles.availabilityBadge,
              dish.BIT240131_IsAvailable
                ? styles.availableBadge
                : styles.stoppedBadge,
            ]}
          >
            <Text
              style={[
                styles.availabilityText,
                dish.BIT240131_IsAvailable
                  ? styles.availableText
                  : styles.stoppedText,
              ]}
            >
              {dish.BIT240131_IsAvailable ? t.available : t.stopped}
            </Text>
          </View>
        </View>
        <Text style={styles.detailCategory}>{category}</Text>
      </View>
      <View style={styles.infoCard}>
        <DetailRow label={t.price} value={`${dish.BIT240131_Price.toLocaleString()}₫`} />
        <DetailRow
          label={t.preparationTime}
          value={`${dish.BIT240131_PreparationTime} ${t.minutes} · ${
            dish.BIT240131_PreparationTime <= 15 ? t.quick : t.regular
          }`}
        />
        <DetailRow
          label={t.description}
          value={displayDishDescription(dish, language) || t.noDescription}
        />
      </View>
      <View style={styles.galleryHeading}>
        <Text style={styles.sectionTitle}>{t.images}</Text>
        <Text style={styles.resultCount}>
          {t.imageCount(dish.BIT240131_DishImage.length)}
        </Text>
      </View>
      {dish.BIT240131_DishImage.length === 0 ? (
        <Text style={styles.emptyNote}>{t.noImages}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dish.BIT240131_DishImage.map((image, index) => (
            <ImageTile
              key={`${image.BIT240131_ImageUrl}-${index}`}
              image={image}
              index={index}
              language={language}
              onSetThumbnail={onSetThumbnail}
            />
          ))}
        </ScrollView>
      )}
      <View style={styles.actionRow}>
        <AppButton label={t.edit} onPress={onEdit} />
        <AppButton kind="danger" label={t.delete} onPress={onDelete} />
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ImageTile({
  image,
  index,
  language,
  onSetThumbnail,
}: {
  image: ImageEntry;
  index: number;
  language: Language;
  onSetThumbnail: (index: number) => void;
}) {
  const t = copy[language];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onSetThumbnail(index)}
      style={styles.imageTile}
    >
      <Image source={{ uri: image.BIT240131_ImageUrl }} style={styles.galleryImage} />
      <Text style={styles.imageUrl} numberOfLines={1}>
        {image.BIT240131_ImageUrl}
      </Text>
      <Text
        style={[
          styles.thumbnailTag,
          image.BIT240131_IsThumbnail && styles.thumbnailTagActive,
        ]}
      >
        {image.BIT240131_IsThumbnail ? t.thumbnail : t.makeThumbnail}
      </Text>
    </Pressable>
  );
}

function DishForm({
  dish,
  categories,
  dishes,
  language,
  onCancel,
  onSave,
}: {
  dish?: Dish;
  categories: Category[];
  dishes: Dish[];
  language: Language;
  onCancel: () => void;
  onSave: (dish: Dish) => void;
}) {
  const t = copy[language];
  const [name, setName] = useState(dish?.BIT240131_Name ?? "");
  const [price, setPrice] = useState(
    dish ? String(dish.BIT240131_Price) : "",
  );
  const [time, setTime] = useState(
    dish ? String(dish.BIT240131_PreparationTime) : "",
  );
  const [description, setDescription] = useState(
    dish?.BIT240131_Description ?? "",
  );
  const [categoryId, setCategoryId] = useState(
    dish?.BIT240131_DishCategoryId ?? categories[0]?.BIT240131_Id ?? "",
  );
  const [available, setAvailable] = useState(
    dish?.BIT240131_IsAvailable ?? true,
  );
  const [images, setImages] = useState<ImageEntry[]>(
    dish?.BIT240131_DishImage ?? [],
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [error, setError] = useState("");

  const addImage = () => {
    const url = newImageUrl.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) {
      setError(t.invalidImageUrl);
      return;
    }
    if (images.some((image) => image.BIT240131_ImageUrl === url)) {
      setError(t.duplicateImageUrl);
      return;
    }
    setImages((current) => [
      ...current,
      {
        BIT240131_ImageUrl: url,
        BIT240131_IsThumbnail: current.length === 0,
      },
    ]);
    setNewImageUrl("");
    setError("");
  };

  const submit = () => {
    const numericPrice = Number(price);
    const numericTime = Number(time);
    if (name.trim() === "") {
      setError(t.nameRequired);
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError(t.priceInvalid);
      return;
    }
    if (!Number.isInteger(numericTime) || numericTime <= 0) {
      setError(t.timeInvalid);
      return;
    }
    if (!categories.some((item) => item.BIT240131_Id === categoryId)) {
      setError(t.categoryRequired);
      return;
    }
    const duplicate = dishes.some(
      (item) =>
        item.BIT240131_Id !== dish?.BIT240131_Id &&
        item.BIT240131_DishCategoryId === categoryId &&
        item.BIT240131_Name.trim().toLocaleLowerCase() ===
          name.trim().toLocaleLowerCase(),
    );
    if (duplicate) {
      setError(t.duplicateDishName);
      return;
    }
    const selectedThumbnail = images.findIndex(
      (image) => image.BIT240131_IsThumbnail,
    );
    const thumbnailIndex =
      selectedThumbnail === -1 && images.length > 0 ? 0 : selectedThumbnail;
    const normalizedImages = images.map((image, index) => ({
      ...image,
      BIT240131_IsThumbnail: index === thumbnailIndex,
    }));
    onSave({
      BIT240131_Id: dish?.BIT240131_Id ?? makeId("dish"),
      BIT240131_Name: name.trim(),
      BIT240131_Price: numericPrice,
      BIT240131_PreparationTime: numericTime,
      BIT240131_IsAvailable: available,
      BIT240131_Description: description.trim(),
      BIT240131_DishCategoryId: categoryId,
      BIT240131_DishImage: normalizedImages,
      BIT240131_ClientId: dish?.BIT240131_ClientId ?? makeId("client"),
      BIT240131_ApiId: dish?.BIT240131_ApiId,
      BIT240131_UpdatedAt: new Date().toISOString(),
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.pageContent}>
        <AppButton kind="quiet" label={`‹  ${t.back}`} onPress={onCancel} />
        <Text style={styles.pageTitle}>{dish ? t.editDish : t.addDish}</Text>
        <Text style={styles.pageSubtitle}>{t.formSubtitle}</Text>
        <View style={styles.formCard}>
          <Field
            label={t.name}
            placeholder={t.namePlaceholder}
            value={name}
            onChangeText={setName}
          />
          <Field
            label={t.price}
            keyboardType="decimal-pad"
            placeholder="50000"
            value={price}
            onChangeText={setPrice}
          />
          <Field
            label={t.preparationTime}
            keyboardType="numeric"
            placeholder="15"
            value={time}
            onChangeText={setTime}
          />
          <Text style={styles.fieldLabel}>{t.category}</Text>
          <View style={styles.chipRow}>
            {categories.map((category) => (
              <ChoiceChip
                key={category.BIT240131_Id}
                label={displayCategoryName(category, language)}
                selected={categoryId === category.BIT240131_Id}
                onPress={() => setCategoryId(category.BIT240131_Id)}
              />
            ))}
          </View>
          <Field
            label={t.description}
            multiline
            placeholder={t.descriptionPlaceholder}
            value={description}
            onChangeText={setDescription}
          />
          <View style={styles.availabilityRow}>
            <View>
              <Text style={styles.fieldLabel}>{t.sellingStatus}</Text>
              <Text style={styles.helperText}>
                {available ? t.available : t.stopped}
              </Text>
            </View>
            <Switch
              onValueChange={setAvailable}
              trackColor={{ false: "#d2d4df", true: "#b7b0f2" }}
              thumbColor={available ? BRAND : "#f4f4f7"}
              value={available}
            />
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.panelTitle}>{t.images}</Text>
          <Text style={styles.helperText}>{t.imageHelp}</Text>
          <Field
            label={t.imageUrl}
            placeholder="https://example.com/dish.jpg"
            value={newImageUrl}
            onChangeText={setNewImageUrl}
          />
          <AppButton
            compact
            kind="secondary"
            label={`＋  ${t.addImage}`}
            onPress={addImage}
          />
          {images.map((image, index) => (
            <View key={`${image.BIT240131_ImageUrl}-${index}`} style={styles.formImageRow}>
              <Image
                source={{ uri: image.BIT240131_ImageUrl }}
                style={styles.formImagePreview}
              />
              <View style={styles.formImageInfo}>
                <Text numberOfLines={1} style={styles.imageUrl}>
                  {image.BIT240131_ImageUrl}
                </Text>
                <Pressable
                  onPress={() =>
                    setImages((current) =>
                      current.map((entry, entryIndex) => ({
                        ...entry,
                        BIT240131_IsThumbnail: entryIndex === index,
                      })),
                    )
                  }
                >
                  <Text style={styles.clearText}>
                    {image.BIT240131_IsThumbnail ? t.thumbnail : t.makeThumbnail}
                  </Text>
                </Pressable>
              </View>
              <Pressable
                accessibilityLabel={t.removeImage}
                onPress={() =>
                  setImages((current) => {
                    const remaining = current.filter(
                      (_, imageIndex) => imageIndex !== index,
                    );
                    if (!remaining.some((entry) => entry.BIT240131_IsThumbnail) && remaining[0]) {
                      remaining[0] = {
                        ...remaining[0],
                        BIT240131_IsThumbnail: true,
                      };
                    }
                    return remaining;
                  })
                }
              >
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
        {error !== "" && (
          <Text accessibilityRole="alert" style={styles.validationText}>
            {error}
          </Text>
        )}
        <View style={styles.actionRow}>
          <AppButton kind="secondary" label={t.cancel} onPress={onCancel} />
          <AppButton label={dish ? t.saveChanges : t.createDish} onPress={submit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function EmptyState({
  message,
  action,
  onAction,
}: {
  message: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🍲</Text>
      <Text style={styles.emptyText}>{message}</Text>
      <AppButton compact kind="secondary" label={action} onPress={onAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  flex: { flex: 1 },
  topBar: {
    alignItems: "center",
    backgroundColor: SURFACE,
    borderBottomColor: "#ececf3",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  brandKicker: {
    color: BRAND,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  brandTitle: { color: INK, fontSize: 17, fontWeight: "800", marginTop: 2 },
  studentName: { color: MUTED, fontSize: 10, marginTop: 2 },
  statusBar: {
    alignItems: "center",
    backgroundColor: SURFACE,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 36,
    paddingHorizontal: 20,
  },
  statusLeft: { alignItems: "center", flexDirection: "row", gap: 7 },
  statusDot: { borderRadius: 5, height: 8, width: 8 },
  statusDotOnline: { backgroundColor: "#35b77c" },
  statusDotOffline: { backgroundColor: "#e69b43" },
  statusText: { color: MUTED, fontSize: 11, fontWeight: "700" },
  pendingText: { color: BRAND, fontSize: 11, fontWeight: "700" },
  configHint: { color: "#a26a28", fontSize: 10, maxWidth: 150, textAlign: "right" },
  errorBanner: {
    backgroundColor: "#fff0ef",
    color: "#bd443c",
    fontSize: 12,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
  },
  listContent: { padding: 16, paddingBottom: 36 },
  heroCard: {
    alignItems: "center",
    backgroundColor: "#ece9ff",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
    minHeight: 112,
    overflow: "hidden",
    padding: 20,
  },
  heroCopy: { flex: 1 },
  heroEyebrow: { color: BRAND, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  heroTitle: { color: INK, fontSize: 22, fontWeight: "900", marginTop: 5 },
  heroSubtitle: { color: MUTED, fontSize: 12, marginTop: 5 },
  heroIcon: { fontSize: 42, marginLeft: 12 },
  button: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: BRAND,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  button_primary: { backgroundColor: BRAND },
  button_secondary: { backgroundColor: "#efedff" },
  button_danger: { backgroundColor: "#fff0ef" },
  button_quiet: { alignSelf: "flex-start", backgroundColor: "transparent", minHeight: 36, paddingLeft: 0 },
  buttonCompact: { alignSelf: "flex-start", minHeight: 34, paddingHorizontal: 13, paddingVertical: 7 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  buttonText_secondary: { color: BRAND },
  buttonText_danger: { color: "#c84c44" },
  buttonText_quiet: { color: BRAND },
  buttonTextCompact: { fontSize: 12 },
  filterCard: {
    backgroundColor: SURFACE,
    borderColor: "#efeff5",
    borderRadius: 17,
    borderWidth: 1,
    marginTop: 14,
    padding: 15,
  },
  panelHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 11 },
  panelTitle: { color: INK, fontSize: 15, fontWeight: "800" },
  clearText: { color: BRAND, fontSize: 12, fontWeight: "800" },
  field: { marginBottom: 13 },
  fieldLabel: { color: INK, fontSize: 12, fontWeight: "700", marginBottom: 7, marginTop: 8 },
  input: {
    backgroundColor: "#fafaff",
    borderColor: "#e7e7f0",
    borderRadius: 11,
    borderWidth: 1,
    color: INK,
    flex: 1,
    fontSize: 14,
    minHeight: 43,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multilineInput: { minHeight: 86, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 7 },
  chip: { backgroundColor: "#f3f3f8", borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  chipSelected: { backgroundColor: "#e8e5ff", borderColor: "#d0cafa", borderWidth: 1 },
  chipText: { color: MUTED, fontSize: 11, fontWeight: "700" },
  chipTextSelected: { color: BRAND },
  priceInputs: { alignItems: "center", flexDirection: "row", gap: 8 },
  rangeSeparator: { color: MUTED, fontSize: 14 },
  validationText: { color: "#c84c44", fontSize: 12, marginTop: 7 },
  resultHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 9, marginTop: 18 },
  sectionTitle: { color: INK, fontSize: 16, fontWeight: "900" },
  resultCount: { color: MUTED, fontSize: 11 },
  dishCard: {
    alignItems: "center",
    backgroundColor: SURFACE,
    borderColor: "#f0f0f5",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 9,
    minHeight: 92,
    padding: 10,
  },
  cardImageWrap: { borderRadius: 12, height: 70, overflow: "hidden", width: 70 },
  cardImage: { height: "100%", width: "100%" },
  imagePlaceholder: { alignItems: "center", backgroundColor: "#f0efff", flex: 1, justifyContent: "center" },
  imagePlaceholderEmoji: { fontSize: 27 },
  cardContent: { flex: 1, marginLeft: 11 },
  cardTopLine: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { color: INK, flex: 1, fontSize: 14, fontWeight: "800", marginRight: 6 },
  priceText: { color: BRAND, fontSize: 12, fontWeight: "900" },
  cardCategory: { color: MUTED, fontSize: 11, marginTop: 4 },
  cardMeta: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 8 },
  metaText: { color: MUTED, fontSize: 10 },
  metaDot: { color: "#b5b8c5", fontSize: 10 },
  availabilityBadge: { borderRadius: 10, marginLeft: "auto", paddingHorizontal: 7, paddingVertical: 4 },
  availableBadge: { backgroundColor: "#e6f7ef" },
  stoppedBadge: { backgroundColor: "#fff0e4" },
  availabilityText: { fontSize: 9, fontWeight: "800" },
  availableText: { color: "#20865a" },
  stoppedText: { color: "#b9742a" },
  chevron: { color: "#a2a5b4", fontSize: 24, marginLeft: 8 },
  pageContent: { padding: 18, paddingBottom: 40 },
  pageTitle: { color: INK, fontSize: 24, fontWeight: "900", marginTop: 4 },
  pageSubtitle: { color: MUTED, fontSize: 13, lineHeight: 19, marginBottom: 16, marginTop: 5 },
  detailHeader: { marginBottom: 17, marginTop: 6 },
  detailTitleRow: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between" },
  detailCategory: { color: BRAND, fontSize: 13, fontWeight: "700", marginTop: 8 },
  infoCard: { backgroundColor: SURFACE, borderRadius: 16, marginBottom: 20, padding: 15 },
  detailRow: { borderBottomColor: "#f0f0f5", borderBottomWidth: 1, paddingVertical: 12 },
  detailLabel: { color: MUTED, fontSize: 11, fontWeight: "700", marginBottom: 5 },
  detailValue: { color: INK, fontSize: 14, lineHeight: 20 },
  galleryHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 11 },
  emptyNote: { color: MUTED, fontSize: 13, paddingVertical: 12 },
  imageTile: { backgroundColor: SURFACE, borderRadius: 14, marginRight: 10, overflow: "hidden", padding: 8, width: 176 },
  galleryImage: { backgroundColor: "#efeff5", borderRadius: 10, height: 125, width: 160 },
  imageUrl: { color: MUTED, fontSize: 10, marginTop: 7 },
  thumbnailTag: { color: BRAND, fontSize: 10, fontWeight: "800", marginTop: 6 },
  thumbnailTagActive: { color: "#21865b" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  formCard: { backgroundColor: SURFACE, borderRadius: 16, marginBottom: 14, padding: 15 },
  helperText: { color: MUTED, fontSize: 11, lineHeight: 17, marginBottom: 7 },
  availabilityRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  formImageRow: { alignItems: "center", borderTopColor: "#f1f1f6", borderTopWidth: 1, flexDirection: "row", gap: 10, marginTop: 11, paddingTop: 10 },
  formImagePreview: { backgroundColor: "#efeff5", borderRadius: 8, height: 48, width: 48 },
  formImageInfo: { flex: 1 },
  removeText: { color: "#c84c44", fontSize: 24, paddingHorizontal: 5 },
  emptyState: { alignItems: "center", backgroundColor: SURFACE, borderRadius: 15, marginTop: 9, padding: 24 },
  emptyEmoji: { fontSize: 32 },
  emptyText: { color: MUTED, fontSize: 13, marginBottom: 13, marginTop: 8, textAlign: "center" },
  mutedText: { color: MUTED, fontSize: 13 },
  centered: { alignItems: "center", flex: 1, justifyContent: "center" },
});
