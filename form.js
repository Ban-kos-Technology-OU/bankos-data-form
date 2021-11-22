/*
  fields -> fields we already have
  rejectCallback -> when application is rejected, this function is called
  fieldCallback -> every time field is updated, data can be used
  language -> form labels language
  apiEndpoint -> api.staging.creditozen.es
*/

const init = ({ fields, rejectCallback, fieldCallback, language, apiEndpoint }) => {  
  console.log("Form loaded")
  
  const translations = {
    ES: {
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      required: "Este campo es obligatorio",
      format: "Porfavor rellena el formato requerido"
    },
    PL: {
      months: ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"],
      required: "To pole jest wymagane",
      format: "Proszę wypełnić wymagany formularz"
    }
  }
  
  const loanFormContainer = document.getElementById('formContainer');
  loanFormContainer.addEventListener('keypress', e => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      render({ path: '/next' })
    }
  })
  
  let currentData = {};
  let key = null;
  
  const setFieldValue = (name, value) => {
    currentData[name] = value;
  }
  
  const mapValuesForSending = data => {
    if(['dateOfBirth','incomeContractStartedAt'].includes(data.currentField)) {
      console.log("mapping", data)
      data[data.currentField] = `${data.year}-${data.month}-${data.day}`;
      delete data.year;
      delete data.month;
      delete data.day
    }
  }
  
  const createInput = ({ name, type='text', value }) => {
    const input = document.createElement('input');
    input.setAttribute('type', type); 
    input.setAttribute('name', name); 
    input.value = value || '';
    if(currentData[name]) input.value = currentData[name];
    input.addEventListener('input', e => {
      setFieldValue(name, e.target.value);
    })
    return input;
  }
  
  const createSelect = ({ name, options, value }) => {
    const select = document.createElement('select');
    select.appendChild(document.createElement('option'));
    for(const option of options){
      const optionElem = document.createElement('option');
      optionElem.setAttribute('value', ['string', 'number'].includes(typeof option) ? option : option.value);
      optionElem.innerText = ['string', 'number'].includes(typeof option) ? option : option.label;
      select.appendChild(optionElem)
    }    
    select.value = value;
    select.addEventListener('change', e => {  
      setFieldValue(name, e.target.value)
    });
    return select;
  }
  
  const renderButtons = () => {
    const buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('class','button-container');
  
    const prevButton = document.createElement('button');
    prevButton.setAttribute('class', 'arrow left');
    prevButton.addEventListener('click', e => {
      console.log(currentData);
      render({ path: '/previous' });
    });
  
    buttonContainer.appendChild(prevButton);
    const nextButton = document.createElement('button');
    nextButton.setAttribute('class', 'arrow right');
    nextButton.addEventListener('click', e => {
      console.log(currentData) 
      render({ path: '/next' });
    })
    buttonContainer.appendChild(nextButton);
    loanFormContainer.appendChild(buttonContainer);
  }
  
  const renderForm = (field, path) => {
    loanFormContainer.innerHTML = '';
    const currentField = field.name;
    const failedValidation = currentField === field.lastField;
    console.log(failedValidation, currentField, currentData.lastField)
    if(currentData[field.name] === undefined) currentData = {};
    currentData.currentField = field.name;
    const elements = [];
      const label = document.createElement('label');
      label.innerText = field.label;
      loanFormContainer.appendChild(label);
      let input, day, month, year;
      switch(field.type){
        case 'string':
          input = createInput({ name: field.name, value: field.value });
          loanFormContainer.appendChild(input);
          input.focus();
          break;
        case 'enum':
          input = createSelect({ name: field.name, options: field.options, value: field.value });
          loanFormContainer.appendChild(input);
          input.focus();
          break;
        case 'number':
          input = createInput({ name: field.name, type: 'number', value: field.value });
          loanFormContainer.appendChild(input);
          break;
        case 'dateOfBirth':
          console.log("Running")
          const dateOfBirth = document.createElement('div');
          dateOfBirth.setAttribute('class', 'date-container');
          day = createSelect({ 
            name: 'day', 
            options: Array.from(Array(31).keys()).map(item => ((item + 1).toString().padStart(2,'0'))), 
            value: field.value ? field.value.split('-')[2] : '' 
          });
          month = createSelect({ 
            name: 'month', 
            options: translations[language].months.map((month, index) => { return { label: month, value: (index +1).toString().padStart(2, '0') }}), 
            value: field.value ? field.value.split('-')[1] : ''  
          });
          year = createSelect({ 
            name: 'year', 
            options: Array.from(Array(65).keys()).map(item => new Date().getFullYear() - 21 - item), 
            value: field.value ? field.value.split('-')[0] : '' 
          });
          dateOfBirth.appendChild(day);
          dateOfBirth.appendChild(month);
          dateOfBirth.appendChild(year);
          loanFormContainer.appendChild(dateOfBirth);
          break;
        case 'datePast':
          console.log("Running")
          const datePast = document.createElement('div');
          datePast.setAttribute('class', 'date-container');
          day = createSelect({ 
            name: 'day', 
            options: Array.from(Array(31).keys()).map(item => ((item + 1).toString().padStart(2,'0'))), 
            value: field.value ? field.value.split('-')[2] : '' 
          });
          month = createSelect({ 
            name: 'month', 
            options: translations[language].months.map((month, index) => { return { label: month, value: (index +1).toString().padStart(2, '0') }}), 
            value: field.value ? field.value.split('-')[1] : ''  
          });
          year = createSelect({ 
            name: 'year', 
            options: Array.from(Array(65).keys()).map(item => new Date().getFullYear() - item), 
            value: field.value ? field.value.split('-')[0] : '' 
          });
          datePast.appendChild(day);
          datePast.appendChild(month);
          datePast.appendChild(year);
          loanFormContainer.appendChild(datePast);
          break;
      }
      if(failedValidation && path === '/next'){
        const errorLabel = document.createElement('div');
        errorLabel.innerText = field.value > '' ? translations[language].format : translations[language].required;
        errorLabel.style.paddingTop = "10px";
        errorLabel.style.color = 'red';
        loanFormContainer.appendChild(errorLabel);
      }
      input && input.focus();
      renderButtons();
  }
  
  const handleResponse = (data, path) => {
    if(data.status === 'redirect'){
      window.location.href = data.redirectUrl;
      localStorage.clear();
    } else if(data.status === 'rejected'){
      rejectCallback();
      localStorage.clear();
    } else {
      renderForm(data, path);
    }
  }
  
  const render = ({ path='/next' }) => {
    if(path === '/next') mapValuesForSending(currentData);
    fetch(`${apiEndpoint}/form${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...currentData, key })}).then(res => res.json()).then(data => {
      if(fieldCallback) fieldCallback(data);
      handleResponse(data, path);
    })
  }

  const params = localStorage.getItem('routeParams') ? Object.fromEntries(localStorage.getItem('routeParams').replace('?', '').split('&').map(item => item.split('='))) : null;
  
  fetch(`${apiEndpoint}/form/createApplication`, 
  { 
    method: 'POST', 
    headers: { 'content-type': 'application/json' }, 
    body: JSON.stringify({
      deviceMemory: navigator.deviceMemory,
      deviceTimezoneOffset: new Date().getTimezoneOffset(),
      deviceResolution: window.screen.width * window.devicePixelRatio + "x" + window.screen.height * window.devicePixelRatio,
      language,
      ...fields,
      click: params && params.cid ? { connect: { id: params.cid } } : undefined
    })
  }).then(res => res.json()).then(data => { 
    key = data.key;
    render({ path: '/next' });
  });

  const updateField = (name, value) => {
    fetch(`${apiEndpoint}/form/next`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' }, 
      body: JSON.stringify({
        key,
        currentField: name,
        [name]: value
      })
    })
  }

  return { updateField }

}

if(typeof window !== 'undefined') window.initForm = init;