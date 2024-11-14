const innInput = document.querySelector('#inn');
const numInput = document.querySelector('#notification-num');
const nameInput = document.querySelector('#name');
const button = document.querySelector('#submit');

innInput.value = '0278922311';
numInput.value = '32414110847';

function handleSubmit(e) {
  e.preventDefault();
  const inn = innInput.value;

  const num = numInput.value;

  const urlsArray = [
    `http://localhost:3000/proxy-rusprofile?inn=${inn}`,
    `http://localhost:3000/proxy-zakupki?num=${num}`
  ];
  fetchData(urlsArray);
}

button.addEventListener('click', handleSubmit)

async function fetchData(urls) {
  try {
    const responses = await Promise.all(urls.map(url => fetch(url)));

    // Map each response to JSON data
    const data = await Promise.all(responses.map(response => response.json()));
    const combinedJson = {...data[0], ...data[1]}
    console.log(combinedJson);
    
  } catch (err) {
    console.error('Error fetching data:', error);
  }
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
