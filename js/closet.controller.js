'use strict';

console.log('Closet Controller loaded');

const init = function () {
  renderItems();
  renderFilters();
  filterByQueryStringParams();
};

// Rendering Functions

const renderItems = function () {
  const items = getItemsToDisplay();

  const strHtmls = items.map(
    item =>
      `     <article class="item-card" id="${item.id}">
            <header class="item-header">
                <div class="item-img-box">
                    <img class="item-img"
                        src="${item.imageUrl}"
                        alt="" />
                </div>
                <p class="item-name">
                    ${item.itemName}
                </p>
            </header>
            <div class="item-details">
                <p class="item-brand">${item.brand}
                ${
                  item.isDesigner
                    ? `<span class="designer">designer</span>`
                    : ''
                }
                </p>
                <p class="item-color">${item.colorName}</p>
                <p class="item-size">Size: ${item.size}</p>
                <button class="item-remove" onclick="onRemoveItem('${
                  item.id
                }')"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="inherit" stroke="inherit"><path d="M12 12.707l6.846 6.846.708-.707L12.707 12l6.847-6.846-.707-.708L12 11.293 5.154 4.446l-.707.708L11.293 12l-6.846 6.846.707.707L12 12.707z"></path></svg></button>
            </div>
            <button class="item-update" onclick="onRenderModal('${
              item.id
            }')">update item</button>

        </article>`
  );
  document.querySelector('.items-section').innerHTML = !strHtmls.length
    ? renderNoItemMsg()
    : strHtmls.join('');
};

const renderFilters = function () {
  const mainCategories = getMainCategories();
  const colors = getColors();

  let strHTMLs = mainCategories.map(
    category => `
     <li class="main-category" id="${category}" onclick="onFilterByMainCategory('${category}')">${category}</li>
    `
  );
  document.querySelector('.main-categories').innerHTML = strHTMLs.join('');

  strHTMLs = colors.map(
    color => `
    <li id="${color}" class="color" onclick="onFilterByColor('${color}')">
    <div class="color-tag ${color}"></div>
    ${color}
    </li>
    `
  );
  document.querySelector('.colors').innerHTML = strHTMLs.join('');
};

const onRenderModal = function (itemId) {
  const credentials = {
    item: itemId ? getItem(itemId) : {},
    colors: getColors().sort(),
    mainCategories: getMainCategories(),
    type: itemId ? 'update' : 'add',
  };
  const elModal = document.querySelector('.modal-body');
  const html = getContent(credentials);
  elModal.innerHTML = html;
  openModal();
};

// Filter and Sort
const onFilterByTxt = function (txt) {
  setFilterByTxt(txt.toLowerCase());
  renderItems();
};

const onFilterByMainCategory = function (newCategory) {
  const currCategory = getFilterByMainCategory();

  if (currCategory === newCategory) {
    setFilterByMainCategory('');
    document.getElementById(newCategory).classList.remove('active');
  } else {
    document.getElementById(currCategory)?.classList.remove('active');
    setFilterByMainCategory(newCategory);
    document.getElementById(newCategory).classList.add('active');
  }
  renderItems();
  setQueryStringParams();
};

const onFilterByColor = function (color) {
  // clearSearchBar();
  const currColor = getFilterByColor();
  if (currColor === color) {
    setFilterByColor('');
    document.getElementById(color).classList.remove('active');
  } else {
    document.getElementById(currColor)?.classList.remove('active');
    setFilterByColor(color);
    document.getElementById(color).classList.add('active');
  }
  renderItems();
  setQueryStringParams();
};

const filterByQueryStringParams = function () {
  // Retrieve data from the current query-params
  const queryStringParams = new URLSearchParams(window.location.search);
  const filterBy = {
    mainCategory: queryStringParams.get('category') || '',
    color: queryStringParams.get('color') || '',
  };

  if (filterBy.mainCategory) onFilterByMainCategory(filterBy.mainCategory);
  if (filterBy.color) onFilterByColor(filterBy.color);
};

const setQueryStringParams = function () {
  const queryStringParams = `?category=${getFilterByMainCategory()}&color=${getFilterByColor()}`;
  const newUrl =
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname +
    queryStringParams;
  window.history.pushState({ path: newUrl }, '', newUrl);
};

const onSetSort = function (sortBy) {
  console.log(`Sorting by ${sortBy}`);
  setSortBy(sortBy);
  renderItems();
};

// Updateing Database
const onAddItem = function (ev) {
  ev.preventDefault();

  let elItemName = document.querySelector('[name=item-name]');
  let elColorKey = document.querySelector('[name=item-color]');
  let elSize = document.querySelector('[name=item-size]');
  let elBrand = document.querySelector('[name=item-brand]');
  let elMainCategory = document.querySelector('[name=item-main-cat]');
  let elSubCategories = document.querySelector('[name=item-sub-cat]');
  let elImageUrl = document.querySelector('[name=item-url]');

  const formDetails = {
    itemName: elItemName.value.toLowerCase(),
    colorKey: elColorKey.value,
    size: elSize.value.toLowerCase(),
    brand: elBrand.value.toLowerCase(),
    mainCategory: elMainCategory.value,
    subCategories: elSubCategories.value.toLowerCase(),
    imageUrl: elImageUrl.value,
  };
  const newItem = addItem(formDetails);
  elItemName.value = '';
  elColorKey.value = '';
  elSize.value = '';
  elBrand.value = '';
  elMainCategory.value = '';
  elSubCategories.value = '';
  elImageUrl.value = '';
  flashMsg(newItem.itemName, 'added to your closet');
  renderItems();
  onCloseModal();
};

const onRemoveItem = function (itemId) {
  const itemName = getItemName(itemId);
  if (
    confirm(
      `Are you sure you want to remove "${itemName.toLocaleUpperCase()}" from your closet?`
    )
  ) {
    console.log(`Removing item ${itemId}`);
    removeItem(itemId);
    flashMsg(itemName, 'removed from your closet');
    renderItems();
  }
};
const onUpdateItem = function (ev, itemId) {
  ev.preventDefault();
  let color1 = document.querySelector('[name=item-color-1]').value;
  let color2 = document.querySelector('[name=item-color-2]').value;
  let color3 = document.querySelector('[name=item-color-3]').value;

  console.log(`updating ${itemId}`);
  const formDetails = {
    itemName: document.querySelector('[name=item-name]').value.toLowerCase(),
    colorName: document
      .querySelector('[name=item-color-name]')
      .value.toLowerCase(),
    colorKey: [color1, color2, color3].filter(Boolean),
    size: document.querySelector('[name=item-size]').value.toLowerCase(),
    brand: document.querySelector('[name=item-brand]').value.toLowerCase(),
    mainCategory: document.querySelector('[name=item-main-cat]').value,
    subCategories: document
      .querySelector('[name=item-sub-cat]')
      .value.toLowerCase(),
    collections: document
      .querySelector('[name=item-collections]')
      .value.toLowerCase(),
    imageUrl: document.querySelector('[name=item-url]').value,
  };

  const updatedItem = updateItem(itemId, formDetails);
  onCloseModal();
  renderItems();
  flashMsg(updatedItem.itemName, 'updated');
};

// modals and msgs

const clearSearchBar = function () {
  onFilterByTxt('');
  document.querySelector('input[name="search-bar"]').value = '';
};

const flashMsg = function (itemName, msg) {
  let msgHTML = `<p>${itemName.toLocaleUpperCase()} has been ${msg} successfully</p>`;
  const el = document.querySelector('.user-msg');
  el.innerHTML = msgHTML;
  el.classList.add('open');
  setTimeout(() => {
    el.classList.remove('open');
  }, 5000);
};

const renderNoItemMsg = function () {
  const msg = getFilterByTxt()
    ? `<p class="usr-msg"> No such items</p>`
    : `<p class="usr-msg">No ${getFilterByMainCategory()} in ${getFilterByColor()}, Try another combination</p>`;
  return msg;
};

const openModal = function () {
  document.querySelector('.modal').classList.add('open');
};

const onCloseModal = function () {
  document.querySelector('.modal').classList.remove('open');
};

const getContent = function ({ type, colors, mainCategories, item }) {
  let html = '';
  switch (type) {
    case 'add':
      html = `
      <form class="form add-item" onsubmit="onAddItem(event)">
                    <div class="input-wrapper">
                        <label for="item-name">description</label>
                        <input name="item-name" type="text" required />
                    </div>
                    <div class="input-wrapper">
                        <label for="item-color">Color</label>
                        <select name="item-color" required>
                            <option value="">choose color</option>
                            ${colors
                              .map(
                                color =>
                                  `<option value="${color}">${color}</option>`
                              )
                              .join('')}
                        </select>
                    </div>
                    <div class="input-wrapper">
                        <label for="item-size">size</label>
                        <input name="item-size" type="text" required />
                    </div>
                    <div class="input-wrapper">
                        <label for="item-brand">brand</label>
                        <input name="item-brand" type="text" required />
                    </div>
                    <div class="input-wrapper"> <label for="item-main-cat">Main Category</label>
                        <select name="item-main-cat" required>
                            <option value="">select main category</option>
                            ${mainCategories
                              .map(
                                category =>
                                  `<option value="${category}">${category}</option>`
                              )
                              .join('')}
                        </select>
                    </div>
                    <div class="input-wrapper"> <label for="item-sub-cat">Other Categories</label>
                        <input name="item-sub-cat" type="text" required />
                    </div>
                    <div class="input-wrapper"> <label for="item-url">image URL</label>
                        <input name="item-url" type="url" required />
                    </div>
    
                    <button>Add</button>
                </form>
      
      
      `;
      break;
    case 'update':
      html = `
            <form class="form update-item" onsubmit="onUpdateItem(event,'${
              item.id
            }')">
                    <div class="input-wrapper">
                        <label for="item-name">description</label>
                        <input name="item-name" type="text" required value="${
                          item.itemName
                        }"/>
                    </div>
                                        <div class="input-wrapper">
                        <label for="item-color-name">color name</label>
                        <input name="item-color-name" type="text" value="${
                          item.colorName
                        }"  />
                    </div>
                    <div class="input-wrapper colors-wrapper">
                    ${_getColorOptions(item.colorKey)}
                    </div>

                    <div class="input-wrapper">
                        <label for="item-size">size</label>
                        <input name="item-size" type="text" value="${
                          item.size
                        }" required />
                    </div>
                    <div class="input-wrapper">
                        <label for="item-brand">brand</label>
                        <input name="item-brand" type="text" value="${
                          item.brand
                        }" required />
                    </div>
                    <div class="input-wrapper"> <label for="item-main-cat">Main Category</label>
                        <select name="item-main-cat" required>
                            <option value="">select main category</option>
                            ${mainCategories
                              .map(
                                category =>
                                  `<option value="${category}" ${
                                    category === item.mainCategory
                                      ? 'selected'
                                      : ''
                                  }>${category}</option>`
                              )
                              .join('')}
                        </select>
                    </div>
                    <div class="input-wrapper"> <label for="item-sub-cat">Other Categories</label>
                        <input name="item-sub-cat" type="text" value="${item.subCategories.join(
                          ', '
                        )}" required />
                    </div>
                    <div class="input-wrapper"> <label for="item-collections">collections</label>
                        <input name="item-collections" type="text" value="${item.collections.join(
                          ', '
                        )}" />
                    </div>
                    <div class="input-wrapper"> <label for="item-url">image URL</label>
                        <input name="item-url" type="url" value="${
                          item.imageUrl
                        }" required />
                    </div>
    
                    <button>update</button>
                </form>
      `;
      break;
    default:
      break;
  }
  return html;
};

const onResetSearch = function () {
  console.log('reset');
  onFilterByColor(getFilterByColor());
  onFilterByMainCategory(getFilterByMainCategory());
  clearSearchBar();
};

function _getColorOptions(itemColors) {
  const allColors = getColors();

  // Giving options for 3 colors per item
  while (itemColors.length < 3) {
    itemColors.push('');
  }
  let html = itemColors.map(
    (itemColor, idx) =>
      `                    
      <label class="color-label" for="item-color-${idx + 1}">Color ${idx + 1}
            <select name="item-color-${idx + 1}" ${idx === 0 ? 'required' : ''}>
          <option value="">choose color</option>
            ${allColors
              .map(
                color =>
                  `<option value="${color}" ${
                    color === itemColor ? 'selected' : ''
                  }>${color} </option>`
              )
              .join('')}
      </select>
      </label>

      `
  );

  return html.join('');
}
