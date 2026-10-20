import { Language, SortOrder, StatusFilter } from "./types";

type Translation = {
  appTitle: string;
  collection: string;
  manageDishes: string;
  addDish: string;
  filters: string;
  clear: string;
  search: string;
  searchPlaceholder: string;
  category: string;
  all: string;
  status: string;
  statusOptions: Record<StatusFilter, string>;
  priceRange: string;
  minimum: string;
  maximum: string;
  invalidRange: string;
  sortBy: string;
  sortOptions: Record<SortOrder, string>;
  catalogCount: (count: number) => string;
  dishList: string;
  results: (count: number) => string;
  noDishes: string;
  clearFilters: string;
  minutes: string;
  quick: string;
  regular: string;
  available: string;
  stopped: string;
  back: string;
  price: string;
  preparationTime: string;
  description: string;
  noDescription: string;
  images: string;
  imageCount: (count: number) => string;
  noImages: string;
  edit: string;
  delete: string;
  deleteTitle: string;
  deleteConfirm: (name: string) => string;
  cancel: string;
  unknownCategory: string;
  notFound: string;
  checking: string;
  syncing: string;
  online: string;
  offline: string;
  pending: (count: number) => string;
  apiNotConfigured: string;
  syncError: string;
  storageError: string;
  loading: string;
  thumbnail: string;
  makeThumbnail: string;
  editDish: string;
  formSubtitle: string;
  name: string;
  namePlaceholder: string;
  nameRequired: string;
  priceInvalid: string;
  timeInvalid: string;
  categoryRequired: string;
  duplicateDishName: string;
  sellingStatus: string;
  imageHelp: string;
  imageUrl: string;
  addImage: string;
  invalidImageUrl: string;
  duplicateImageUrl: string;
  removeImage: string;
  descriptionPlaceholder: string;
  createDish: string;
  saveChanges: string;
};

export const copy: Record<Language, Translation> = {
  en: {
    appTitle: "Food Manager",
    collection: "YOUR MENU",
    manageDishes: "Manage dishes",
    catalogCount: (count: number) => `${count} dishes in your catalog`,
    addDish: "Add dish",
    filters: "Search & filters",
    clear: "Clear",
    search: "Search by name",
    searchPlaceholder: "Type a dish name...",
    category: "Category",
    all: "All",
    status: "Selling status",
    statusOptions: {
      all: "All",
      available: "Available",
      stopped: "Stopped",
    },
    priceRange: "Price range (VND)",
    minimum: "Min",
    maximum: "Max",
    invalidRange: "Enter a valid price range: minimum must not exceed maximum.",
    sortBy: "Sort by",
    sortOptions: {
      none: "Default",
      priceAsc: "Price ↑",
      priceDesc: "Price ↓",
      timeAsc: "Prep time ↑",
    },
    dishList: "Dish list",
    results: (count: number) => `${count} results`,
    noDishes: "No dishes match these filters.",
    clearFilters: "Clear filters",
    minutes: "min",
    quick: "Quick",
    regular: "Regular",
    available: "Available",
    stopped: "Stopped",
    back: "Back",
    price: "Price",
    preparationTime: "Preparation time",
    description: "Description",
    noDescription: "No description provided.",
    images: "Dish images",
    imageCount: (count: number) => `${count} images`,
    noImages: "No images have been added.",
    edit: "Edit",
    delete: "Delete",
    deleteTitle: "Delete dish?",
    deleteConfirm: (name: string) => `Delete "${name}"? This cannot be undone.`,
    cancel: "Cancel",
    unknownCategory: "Unknown category",
    notFound: "This dish no longer exists.",
    checking: "Checking connection",
    syncing: "Syncing changes...",
    online: "Online",
    offline: "Offline · changes saved locally",
    pending: (count: number) => `${count} pending`,
    apiNotConfigured: "Set MockAPI URL in .env",
    syncError: "Sync failed",
    storageError: "Local storage error",
    loading: "Loading menu...",
    thumbnail: "★ Main image",
    makeThumbnail: "Set as main image",
    editDish: "Edit dish",
    formSubtitle: "Dish details are saved on this device and synced when online.",
    name: "Dish name",
    namePlaceholder: "e.g. Chicken rice",
    nameRequired: "Dish name is required.",
    priceInvalid: "Price must be a number greater than 0.",
    timeInvalid: "Preparation time must be a whole number greater than 0.",
    categoryRequired: "Choose a valid category.",
    duplicateDishName: "A dish with this name already exists in this category.",
    sellingStatus: "Selling status",
    imageHelp: "Add image URLs and choose at most one main image.",
    imageUrl: "Image URL",
    addImage: "Add image",
    invalidImageUrl: "Enter a valid http or https image URL.",
    duplicateImageUrl: "This image URL has already been added.",
    removeImage: "Remove image",
    descriptionPlaceholder: "Describe this dish...",
    createDish: "Create dish",
    saveChanges: "Save changes",
  },
  vi: {
    appTitle: "Quản lý món ăn",
    collection: "THỰC ĐƠN CỦA BẠN",
    manageDishes: "Quản lý món ăn",
    catalogCount: (count: number) => `${count} món trong danh sách`,
    addDish: "Thêm món",
    filters: "Tìm kiếm & bộ lọc",
    clear: "Xóa lọc",
    search: "Tìm theo tên",
    searchPlaceholder: "Nhập tên món...",
    category: "Loại món",
    all: "Tất cả",
    status: "Trạng thái bán",
    statusOptions: {
      all: "Tất cả",
      available: "Đang bán",
      stopped: "Ngừng bán",
    },
    priceRange: "Khoảng giá (VND)",
    minimum: "Từ",
    maximum: "Đến",
    invalidRange: "Khoảng giá không hợp lệ: giá tối thiểu không được lớn hơn giá tối đa.",
    sortBy: "Sắp xếp",
    sortOptions: {
      none: "Mặc định",
      priceAsc: "Giá ↑",
      priceDesc: "Giá ↓",
      timeAsc: "Thời gian ↑",
    },
    dishList: "Danh sách món",
    results: (count: number) => `${count} kết quả`,
    noDishes: "Không có món ăn phù hợp với bộ lọc.",
    clearFilters: "Xóa bộ lọc",
    minutes: "phút",
    quick: "Nhanh",
    regular: "Thông thường",
    available: "Đang bán",
    stopped: "Ngừng bán",
    back: "Quay lại",
    price: "Giá",
    preparationTime: "Thời gian chế biến",
    description: "Mô tả",
    noDescription: "Chưa có mô tả.",
    images: "Ảnh món ăn",
    imageCount: (count: number) => `${count} ảnh`,
    noImages: "Chưa thêm ảnh.",
    edit: "Sửa",
    delete: "Xóa",
    deleteTitle: "Xóa món ăn?",
    deleteConfirm: (name: string) => `Xóa "${name}"? Thao tác này không thể hoàn tác.`,
    cancel: "Hủy",
    unknownCategory: "Loại món không xác định",
    notFound: "Món ăn này không còn tồn tại.",
    checking: "Đang kiểm tra kết nối",
    syncing: "Đang đồng bộ...",
    online: "Có mạng",
    offline: "Ngoại tuyến · đã lưu trên máy",
    pending: (count: number) => `${count} thay đổi chờ đồng bộ`,
    apiNotConfigured: "Cấu hình URL MockAPI trong .env",
    syncError: "Đồng bộ thất bại",
    storageError: "Lỗi lưu trữ cục bộ",
    loading: "Đang tải thực đơn...",
    thumbnail: "★ Ảnh đại diện",
    makeThumbnail: "Đặt làm ảnh đại diện",
    editDish: "Chỉnh sửa món",
    formSubtitle: "Dữ liệu được lưu trên thiết bị và tự đồng bộ khi có mạng.",
    name: "Tên món",
    namePlaceholder: "Ví dụ: Cơm gà",
    nameRequired: "Tên món không được để trống.",
    priceInvalid: "Giá phải là số lớn hơn 0.",
    timeInvalid: "Thời gian chế biến phải là số nguyên lớn hơn 0.",
    categoryRequired: "Hãy chọn một loại món hợp lệ.",
    duplicateDishName: "Tên món đã tồn tại trong loại này.",
    sellingStatus: "Trạng thái bán",
    imageHelp: "Thêm URL ảnh và chọn tối đa một ảnh đại diện.",
    imageUrl: "Đường dẫn ảnh",
    addImage: "Thêm ảnh",
    invalidImageUrl: "Nhập URL ảnh hợp lệ bắt đầu bằng http hoặc https.",
    duplicateImageUrl: "URL ảnh này đã được thêm.",
    removeImage: "Xóa ảnh",
    descriptionPlaceholder: "Mô tả món ăn...",
    createDish: "Tạo món",
    saveChanges: "Lưu thay đổi",
  },
};
