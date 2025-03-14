'use strict';
console.log('Closet service loaded');
let gItems;
const STORAGE_KEY = 'closetDB';
const gFilterBy = {
  txt: '',
  mainCategory: '',
  color: '',
};
let gSortBy = '';
const gMainCategories = [
  'clothing',
  'beachwear',
  'accessories',
  'shoes',
  'bags',
  'perfume',
  'jewellery',
];
const gColors = [
  'beige',
  'black',
  'blue',
  'brown',
  'green',
  'grey',
  'khaki',
  'metallic',
  'navy',
  'orange',
  'pink',
  'purple',
  'red',
  'white',
  'yellow',
];

_loadItems();

function getItemsToDisplay() {
  let items = gItems;
  items = items.filter(
    item =>
      item.itemName.includes(gFilterBy.txt) ||
      item.brand.includes(gFilterBy.txt) ||
      item.subCategories.some(subCategory =>
        subCategory.includes(gFilterBy.txt)
      )
  );
  if (gFilterBy.mainCategory) {
    items = items.filter(
      ({ mainCategory }) => mainCategory === gFilterBy.mainCategory
    );
  }

  if (gFilterBy.color) {
    items = items.filter(({ colorKey }) => colorKey.includes(gFilterBy.color));
  }

  switch (gSortBy) {
    case 'a':
      items.sort((item1, item2) => (item1.itemName > item2.itemName ? 0 : -1));
      break;
    case 'z':
      items.sort((item1, item2) => (item1.itemName > item2.itemName ? -1 : 0));
      break;
    case 'createdAt':
      items.sort((item1, item2) => item2.createdAt - item1.createdAt);
      break;

    default:
      break;
  }
  return items;
}

function addItem(details) {
  const item = _createItem(details);
  gItems.unshift(item);
  console.log(item);
  _saveItemsToStorage();
  return item;
}
function updateItem(
  itemId,
  {
    itemName,
    colorKey,
    size,
    brand,
    mainCategory,
    subCategories,
    collections,
    imageUrl,
    colorName,
  }
) {
  const item = gItems.find(item => item.id === itemId);
  item.itemName = itemName;
  item.colorName = colorName;
  item.colorKey = colorKey;
  item.size = size;
  item.brand = brand;
  item.mainCategory = mainCategory;
  item.subCategories = stringToArray(subCategories);
  item.imageUrl = imageUrl;
  item.collections = stringToArray(collections);
  item.isDesigner = item.collections.includes('designer');
  console.log(item);

  _saveItemsToStorage();
  return item;
}
function removeItem(itemId) {
  const idx = gItems.findIndex(item => item.id === itemId);
  gItems.splice(idx, 1);
  _saveItemsToStorage();
}

// Setters
function setFilterByTxt(txt) {
  gFilterBy.txt = txt;
}
function setFilterByMainCategory(newCategory) {
  gFilterBy.mainCategory = newCategory;
}
function setFilterByColor(color) {
  gFilterBy.color = color;
}

function setSortBy(sortBy) {
  gSortBy = sortBy;
}

// Getters
function getFilterByMainCategory() {
  return gFilterBy.mainCategory;
}
function getFilterByTxt() {
  return gFilterBy.txt;
}
function getFilterByColor() {
  return gFilterBy.color;
}
function getMainCategories() {
  return gMainCategories;
}
function getColors() {
  return gColors;
}
function getItemName(itemId) {
  const item = gItems.find(item => item.id === itemId);
  return item.itemName;
}
function getItem(itemId) {
  const item = gItems.find(item => item.id === itemId);
  return item;
}

// Internal
function _createItem({
  itemName,
  colorKey,
  size,
  brand,
  mainCategory,
  subCategories,
  imageUrl,
}) {
  const item = {
    id: _makeId(),
    itemName,
    colorName: colorKey,
    colorKey: [colorKey],
    size,
    brand,
    mainCategory,
    subCategories: subCategories
      .split(',')
      .map(cat => cat.trim())
      .filter(Boolean),
    collections: [],
    imageUrl,
    createdAt: Date.now(),
    isDesigner: false,
  };
  return item;
}

function _saveItemsToStorage() {
  saveToStorage(STORAGE_KEY, gItems);
}

function _loadItems() {
  let items = loadFromStorage(STORAGE_KEY);
  if (!items || !items.length) {
    items = newLocalDB;
  }
  gItems = items;
}
