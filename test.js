let autocomplete;
let formattedAddress;

const addressInput = document.getElementById('shipping_address');
const addressMessage = document.querySelector(
  '#shipping_address + .invalid-feedback'
);
addressMessage.insertAdjacentHTML(
  'afterend',
  '<span id="address-autocorrect" style="cursor: pointer; color: blue; display:none;"></span>'
);
const addressAutocorrect = document.getElementById('address-autocorrect');
addressAutocorrect.addEventListener('click', function () {
  // Set the input value to the suggested address
  addressInput.value = formattedAddress;
  // Clear the suggestion message
  addressAutocorrect.innerText = '';
  addressAutocorrect.style.display = 'none';
});

const cityInput = document.getElementById('city');
const submitButton = document.getElementsByClassName('mf-btn-submit');

// Suggestion
addressInput.addEventListener('input', function () {
  const inputValue = addressInput.value.trim();
  console.log(formattedAddress);
  if (inputValue != formattedAddress && formattedAddress) {
    addressAutocorrect.innerText = '';
    addressAutocorrect.innerText = `Did you mean "${formattedAddress}"?`;
    addressAutocorrect.style.display = 'block';
  } else {
    addressAutocorrect.style.display = 'none';
  }
});

async function validateAddress(addressLines) {
  const requestOptions = {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      address: { addressLines },
      previousResponseId: '',
      enableUspsCass: false,
    }),
  };

  try {
    const response = await fetch(
      'https://addressvalidation.googleapis.com/v1:validateAddress?key=AIzaSyBeR_ux9cS-C5M2wppkeVmB516Oka95ODM',
      requestOptions
    );
    const data = JSON.parse(await response.text()).result;
    formattedAddress = data.address.formattedAddress;
    return data;
  } catch (error) {
    console.log('error', error);
  }
}

function checkConfirmationLevels(obj) {
  try {
    const addressComponents = obj.address.addressComponents;

    let unconfirmedAndSuspiciousCount = 0;
    let unconfirmedButPlausibleCount = 0;

    for (const component of addressComponents) {
      if (component.confirmationLevel === 'UNCONFIRMED_AND_SUSPICIOUS') {
        unconfirmedAndSuspiciousCount++;
      } else if (component.confirmationLevel === 'UNCONFIRMED_BUT_PLAUSIBLE') {
        unconfirmedButPlausibleCount++;
      }
    }

    return (
      unconfirmedAndSuspiciousCount === 0 && unconfirmedButPlausibleCount <= 3
    );
  } catch {}
}

function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(addressInput, {
    types: ['address'],
    componentRestrictions: { country: ['UK'] },
    fields: ['address_components', 'geometry', 'name'],
  });
  addressInput.addEventListener('change', onPlaceChanged);
  autocomplete.addListener('place_changed', onPlaceChanged);
}

async function onPlaceChanged() {
  var place = autocomplete.getPlace();

  console.log(place);
  const validation = await validateAddress(addressInput.value);
  console.log(validation);

  const valid = checkConfirmationLevels(validation);

  // Handle validation result
  if (!valid) {
    addressMessage.innerText =
      'Invalid address. Please select the suitable address.';
    addressMessage.style.display = 'block';
    submitButton.disabled = true;
  } else {
    addressMessage.style.display = 'none';
  }

  // Set City
  cityInput.value =
    place.address_components.find((component) => {
      return component.types.includes('administrative_area_level_2');
    }).long_name || '';

  // Set County
  // 	document.getElementById('city').value = place.address_components.find(component => {
  //   return component.types.includes('administrative_area_level_1');
  // })?.long_name || '';
}
