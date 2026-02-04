const loadingDiv = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const formContainer = document.getElementById('form');
const newValueInput = document.getElementById('new-value-input');
const renameButton = document.getElementById('rename-button');

let propertySelect;
let valueSelect;

let propertiesData = {};
let isInitializing = false; // "traffic controller" flag

// --- bind elements again after selectMenu destroys/rebuilds DOM ---
function bindElements() {
  propertySelect = document.getElementById('property-select');
  valueSelect = document.getElementById('value-select');

  if (propertySelect) {
    propertySelect.onchange = () => {
      updateValueSelectHTML();
      safeInitialize();
    };
  }
}

// Safe init wrapper
function safeInitialize() {
  if (isInitializing) return;
  isInitializing = true;

  if (window.selectMenu) {
    selectMenu.destroy();
    setTimeout(() => {
      selectMenu.init();
      bindElements(); // rebind after init
      setTimeout(() => { isInitializing = false; }, 100);
    }, 50);
  } else {
    isInitializing = false;
  }
}

function updateValueSelectHTML() {
  if (!propertySelect || !valueSelect) return;
  const selectedProp = propertySelect.value;
  const values = propertiesData[selectedProp] || [];

  valueSelect.innerHTML = '';
  values.forEach(val => {
    valueSelect.appendChild(new Option(val, val));
  });
}

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;

  loadingDiv.style.display = 'none';
  errorContainer.style.display = 'none';
  formContainer.style.display = 'none';
  errorContainer.textContent = '';

  if (msg.type === 'INIT_PROPERTIES') {
    formContainer.style.display = 'flex';
    propertiesData = msg.data;

    // Always re-query selects before populating
    bindElements();

    // Populate property dropdown
    propertySelect.innerHTML = '';
    const propertyNames = Object.keys(propertiesData);
    propertyNames.forEach(prop => {
      propertySelect.appendChild(new Option(prop, prop));
    });

    // Populate values dropdown
    updateValueSelectHTML();

    // init DS select menu
    safeInitialize();

  } else if (msg.type === 'ERROR') {
    errorContainer.style.display = 'flex';
    errorContainer.textContent = msg.message;
  }
};

renameButton.onclick = () => {
  parent.postMessage({
    pluginMessage: {
      type: 'RENAME_VALUE',
      property: propertySelect.value,
      oldValue: valueSelect.value,
      newValue: newValueInput.value,
    }
  }, '*');
};
