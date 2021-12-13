/*
  fields -> fields we already have
  rejectCallback -> when application is rejected, this function is called
  fieldCallback -> every time field is updated, data can be used
  language -> form labels language
  apiEndpoint -> api.staging.creditozen.es
*/

const init = ({ fields, rejectCallback, fieldCallback, language, apiEndpoint, bindElement='formContainer' }) => {  
  console.log("Form loaded")
  
  const translations = {
    ES: {
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      required: "Este campo es obligatorio",
      format: "Porfavor rellena el formato requerido",
      true: 'Sí',
      false: 'No'
    },
    PL: {
      months: ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"],
      required: "To pole jest wymagane",
      format: "Proszę wypełnić wymagany formularz",
      true: 'Tak',
      false: 'No'
    }
  }
  
  const loanFormContainer = document.getElementById(bindElement);

  loanFormContainer.addEventListener('keypress', e => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      render({ path: '/next' })
    }
  })
  
  let currentData = {};
  let key = null;
  
  const setFieldValue = (name, value) => {
    console.log(value)
    if(value === 'true') value = true;
    if(value === 'false') value = false;
    currentData[name] = value;
  }
  
  const mapValuesForSending = data => {
    if(['dateOfBirth','incomeContractStartedAt'].includes(data.currentField)) {
      console.log("mapping", data)
      data[data.currentField] = `${data.year}-${data.month}-${data.day}`;
      console.log(data[data.currentField])
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

  const createDatePicker = ({ field, type }) => {
    const datePicker = document.createElement('div');
    datePicker.setAttribute('class', 'date-container');
    currentData.day = field.value ? field.value.split('-')[2] !== 'undefined' ? field.value.split('-')[2] : '' : '';
    currentData.month = field.value ? field.value.split('-')[1] !== 'undefined' ? field.value.split('-')[1] : '' : '';
    currentData.year = field.value ? field.value.split('-')[0] !== 'undefined' ? field.value.split('-')[0] : '' : '';
    const day = createSelect({ 
      name: 'day', 
      options: Array.from(Array(31).keys()).map(item => ((item + 1).toString().padStart(2,'0'))), 
      value: currentData.day
    });
    const month = createSelect({ 
      name: 'month', 
      options: translations[language].months.map((month, index) => { return { label: month, value: (index +1).toString().padStart(2, '0') }}), 
      value: currentData.month
    });
    const year = createSelect({ 
      name: 'year', 
      options: type === 'dateOfBirth' ? Array.from(Array(65).keys()).map(item => new Date().getFullYear() - 21 - item) : Array.from(Array(65).keys()).map(item => new Date().getFullYear() - item), 
      value: currentData.year
    });
    datePicker.appendChild(day);
    datePicker.appendChild(month);
    datePicker.appendChild(year);
    loanFormContainer.appendChild(datePicker);
    return datePicker;
  }
  
  const renderButtons = () => {
    const buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('class','button-container');
  
    const prevButton = document.createElement('button');
    prevButton.setAttribute('class', 'arrow left');
    prevButton.addEventListener('click', e => {
      console.log(currentData);
      prevButton.setAttribute('class', 'lds-dual-ring');
      render({ path: '/previous' });
    });
  
    buttonContainer.appendChild(prevButton);
    const nextButton = document.createElement('button');
    nextButton.setAttribute('class', 'arrow right');
    nextButton.addEventListener('click', e => {
      console.log(currentData);
      nextButton.setAttribute('class', 'lds-dual-ring');
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
      let input;
      switch(field.type){
        case 'string':
          input = createInput({ name: field.name, value: field.value });
          loanFormContainer.appendChild(input);
          break;
        case 'enum':
          input = createSelect({ name: field.name, options: field.options, value: field.value });
          loanFormContainer.appendChild(input);
          break;
        case 'boolean':
          input = createSelect({ name: field.name, options: [{ label: translations[language].true, value: true }, { label: translations[language].false, value: false }], value: field.value });
          loanFormContainer.appendChild(input);
          break;
        case 'number':
          input = createInput({ name: field.name, type: 'number', value: field.value });
          loanFormContainer.appendChild(input);
          break;
        case 'dateOfBirth':
          input = createDatePicker({ field, type: 'dateOfBirth' })
          break;
        case 'datePast':
          input = createDatePicker({ field, type: 'datePast' })
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

  const params = localStorage.getItem('routeParams') ? JSON.parse(localStorage.getItem('routeParams')) : null;
  
  fetch(`${apiEndpoint}/form/createApplication`, 
  { 
    method: 'POST', 
    headers: { 'content-type': 'application/json' }, 
    body: JSON.stringify({
      deviceMemory: navigator.deviceMemory,
      deviceTimezoneOffset: new Date().getTimezoneOffset(),
      deviceResolution: parseInt(window.screen.width * window.devicePixelRatio) + "x" + parseInt(window.screen.height * window.devicePixelRatio),
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