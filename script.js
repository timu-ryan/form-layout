const innInput = document.querySelector('#inn');
const nameInput = document.querySelector('#name');
const numberInput = document.querySelector('#notification-num');
const button = document.querySelector('#submit');

const bankGuaranteeAmountInput = document.querySelector('#bank-guarantee-amount');
const currencyInput = document.querySelector('#currency');
const bankGuaranteeTermInput = document.querySelector('#bank-guarantee-term');
const contractPercentageInput = document.querySelector('#contract-percentage');
const experience44Input = document.querySelector('#experience-44');
const experience223Input = document.querySelector('#experience-223');

const paragraphs = document.querySelectorAll('.search-data p');
const purchaseNumberSpans = document.querySelectorAll('.search-data p span');
const registerTimeElement = document.querySelector('.search-data time');

const isClosedCheckbox = document.querySelector('#is-closed');
const nmzckCheckbox = document.querySelector('#nmzck');
const advancePaymentCheckbox = document.querySelector('#advance-payment');
const customerTemplateCheckbox = document.querySelector('#customer-template');

const formHintElement = document.querySelector('.form__hint');
const loader = document.querySelector('.loader');

function toggleInputAvailability(checkbox, input) {
  input.disabled = !checkbox.checked;
}

isClosedCheckbox.addEventListener('change', () => {
  toggleInputAvailability(isClosedCheckbox, bankGuaranteeAmountInput);
  toggleInputAvailability(isClosedCheckbox, currencyInput);
})

nmzckCheckbox.addEventListener('change', () => {
  toggleInputAvailability(nmzckCheckbox, bankGuaranteeTermInput);
})

advancePaymentCheckbox.addEventListener('change', () => {
  toggleInputAvailability(advancePaymentCheckbox, contractPercentageInput);
})

customerTemplateCheckbox.addEventListener('change', () => {
  toggleInputAvailability(customerTemplateCheckbox, experience44Input);
  toggleInputAvailability(customerTemplateCheckbox, experience223Input);
})

contractPercentageInput.addEventListener('change', () => {
  const val = contractPercentageInput.value;
  if (val < 0) contractPercentageInput.value = 0;
  if (val > 100) contractPercentageInput.value = 100;
})

// innInput.value = '0278922311';
// numberInput.value = '32414110847';

function handleSubmit(e) {
  e.preventDefault();
  loader.classList.remove('visually-hidden');
  const inn = innInput.value;
  const num = numberInput.value;
  if (inn === '' || num === '') {
    formHintElement.classList.remove('visually-hidden');
    loader.classList.add('visually-hidden');
    return;
  } else {
    formHintElement.classList.add('visually-hidden');
  }

  const urlsArray = [
    `http://localhost:3000/proxy-rusprofile?inn=${inn}`,
    `http://localhost:3000/proxy-zakupki?num=${num}`
  ];

  fetchData(urlsArray).then(data => {
    console.log(data)
    const { companyName, foundationDate, nmc, object } = data
    nameInput.value = companyName;

    purchaseNumberSpans[0].textContent = numberInput.value;
    purchaseNumberSpans[1].textContent = formatPrice(nmc);
    registerTimeElement.textContent = foundationDate;
    // TODO: add datetime attribute
    paragraphs[2].textContent = object.replace(/<[^>]*>/g, ''); // regexp убирает теги
  }).finally(() => {
    loader.classList.add('visually-hidden');
  });
}

button.addEventListener('click', handleSubmit)

async function fetchData(urls) {
  try {
    const responses = await Promise.all(urls.map(url => fetch(url)));

    // Map each response to JSON data
    const data = await Promise.all(responses.map(response => response.json()));
    const combinedJson = {...data[0], ...data[1]}
    console.log(combinedJson);
    return combinedJson;
  } catch (err) {
    console.error('Error fetching data:', error);
  }
}

function formatPrice(price) {
  let [integerPart, decimalPart] = price.split(',');
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (decimalPart === undefined) {
    decimalPart = "00";
  } else if (decimalPart.length === 1) {
    decimalPart += "0";
  }
  return `${integerPart},${decimalPart}`;
}

// fetch(`http://localhost:3000/proxy?inn=${inn}`)
//   .then(response => response.text())
//   .then(data => {
//     index = data.indexOf(searchTerm, 0);
//     lastIndex = data.indexOf('" />', index);
//     nameInput.value = data.slice(index + 35, lastIndex).replaceAll('&quot;', '"');
//     console.log(nameInput.value)
//   })
//   .catch(error => console.error('Error:', error));
