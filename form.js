/*
  fields -> fields we already have
  rejectCallback -> when application is rejected, this function is called
  fieldCallback -> every time field is updated, data can be used
  language -> form labels language
  apiEndpoint -> api.staging.creditozen.es
*/




const init = ({ key, fields, rejectCallback, acceptCallback, fieldCallback, language, apiEndpoint, bindElement='formContainer', beforeNext, beforePrevious, showButtonLabels }) => {  

  function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }
  
  let loading = false;
  let currentData = {};

  const translations = {
    ES: {
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      required: "Este campo es obligatorio",
      format: "Porfavor rellena el formato requerido",
      true: 'Sí',
      false: 'No',
      iban: {
        field: 'iban',
        format: 'ES'
      },
      pleaseWait: 'Estamos revisando tus datos. Por favor espere.',
      next: 'Siguiente',
      previous: 'Anterior'
    },
    PL: {
      months: ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"],
      required: "To pole jest wymagane",
      format: "Proszę wypełnić wymagany formularz",
      true: 'Tak',
      false: 'No',
      iban: {
        field: 'iban',
        format: 'PL'
      },
      pleaseWait: 'Sprawdzamy Twoje dane. Proszę czekać.',
      next: 'Next',
      previous: 'Previous'
    },
    MX: {
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      required: "Este campo es obligatorio",
      format: "Porfavor rellena el formato requerido",
      true: 'Sí',
      false: 'No',
      iban: {
        field: 'clabe',
        format: ''
      },
      pleaseWait: 'Estamos revisando tus datos. Por favor espere.',
      next: 'Siguiente',
      previous: 'Anterior'
    },
    KZ: {
      months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      required: "Это поле обязательно для заполнения",
      format: "Пожалуйста, заполните необходимую форму",
      true: 'Да',
      false: 'Нет',
      iban: {
        field: 'iban',
        format: ''
      },
      pleaseWait: 'Мы проверяем ваши данные. Пожалуйста подождите.',
      next: 'Следующий',
      previous: 'Предыдущий'
    }
  }

  translations['es-ES'] = translations.ES;
  translations['es-MX'] = translations.MX;
  translations['pl-PL'] = translations.PL;
  translations['kk-KZ'] = translations.KZ;
  translations['ru-KZ'] = translations.KZ;
  
  const loanFormContainer = document.getElementById(bindElement);

  loanFormContainer.addEventListener('keypress', debounce(e => {
    if(loading) return

    if (e.key === 'Enter' || e.keyCode === 13) {
      
      const nextButton = document.querySelector('.arrow.right')
      const prevButton = document.querySelector('.arrow.left')

      nextButton.setAttribute('class', 'lds-dual-ring');
      prevButton.setAttribute('disabled', true)

      render({ path: '/next' })

    }
  }))
  

  const setFieldValue = (name, value) => {
    if(value === 'true') value = true;
    if(value === 'false') value = false;
    currentData[name] = value;
    if(typeof currentData[name] === 'string') currentData[name] = currentData[name].trim();
  } 

  const dateData = {
    birthDay: {
      minAge:["kk-KZ","ru-KZ"].includes(language) ? 21 : 18,
      maxAge:82
    },
    jobStartDay: {
      minAge:0,
      maxAge:64
    }
  }

  const checkMinAge = (day,month,dayOptions,monthOptions,minAgeYear) => {

    const currentMonth = new Date().getMonth() + 1 
    const currentDay = new Date().getDate()

    if(currentData.year === minAgeYear) {

      if(+currentData.month.replace(/^0+/, '') === currentMonth) {
        dayOptions.map((item,index) => {
          if(index >= currentDay) {
            item.disabled = true
          }
        })

        if(+currentData.day.replace(/^0+/, '') >= currentDay) {
          currentData.day = ""
          day.value = ""
        }
        
      } else {
        dayOptions.map(item => item.disabled = false)
      }

      monthOptions.map((item,index) => {
        if(index > currentMonth) {
          item.disabled = true
        } else {
          item.disabled = false
        }
      })

    if(+currentData.month.replace(/^0+/, '') > currentMonth) {
      currentData.month = ""
      month.value = ""
    }
    }
  }

  const checkMaxAge = (day,month,dayOptions,monthOptions,maxAgeYear) => {

    const currentMonth = new Date().getMonth() + 1 
    const currentDay = new Date().getDate()

    if(currentData.year === maxAgeYear) {

      if(+currentData.month.replace(/^0+/, '') === currentMonth) {
        dayOptions.map((item,index) => {
          if(index < currentDay) {
            item.disabled = true
          }
        })

        if(+currentData.day.replace(/^0+/, '') < currentDay) {
          currentData.day = ""
          day.value = ""
        }
        
      } else {
        dayOptions.map(item => item.disabled = false)
      }

      monthOptions.map((item,index) => {
        if(index < currentMonth) {
          item.disabled = true
        } else {
          item.disabled = false
        }
      })

    if(+currentData.month.replace(/^0+/, '') < currentMonth) {
      currentData.month = ""
      month.value = ""
    }
    } 

  }

  const checkIsDayExist = (day,dayOptions,selectedDateDay) => {
 
      if(currentData.year === "") return

       dayOptions.map((item,index) => {
        if(index > selectedDateDay) {
          item.disabled = true
        }
      })

      if(selectedDateDay < currentData.day) {
        day.value = ''
        currentData.day = ''
      }
    
  }

  
  const checkDate = (minAge,maxAge) => {

    const day = document.getElementById("day")
    const month = document.getElementById("month")

    const selectedMonth = +currentData.month.replace(/^0+/, '')
    const selectedYear = +currentData.year.replace(/^0+/, '')
    const selectedDateDay = new Date(selectedYear,selectedMonth,0).getDate()
    const currentYear = new Date().getFullYear()
    const maxAgeYear = String(currentYear - maxAge)
    const minAgeYear = String(currentYear - minAge)
    const monthOptions = [...month.options]
    const dayOptions = [...day.options]

   
    dayOptions.map(item => item.disabled = false)
    monthOptions.map(item => item.disabled = false)
    

    checkMinAge(day,month,dayOptions,monthOptions,minAgeYear)
    checkMaxAge(day,month,dayOptions,monthOptions,maxAgeYear)
    checkIsDayExist(day,dayOptions,selectedDateDay)

  }

  
  const mapValuesForSending = data => {
    if(['dateOfBirth','incomeContractStartedAt'].includes(data.currentField)) {
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
      if(type === "number") {
        setFieldValue(name, +e.target.value);
      } else {
        setFieldValue(name, e.target.value);
      }
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
    select.id = name
    select.addEventListener('change', e => {  
      setFieldValue(name, e.target.value)
      if(currentData.currentField === "dateOfBirth") checkDate(dateData.birthDay.minAge,dateData.birthDay.maxAge)
      if(currentData.currentField === "incomeContractStartedAt") checkDate(dateData.jobStartDay.minAge,dateData.jobStartDay.maxAge)
    });
    return select;
  }

  const createRadioButtons = ({ name, options, value }) => {

    const radioButtons = document.createElement('div');
    radioButtons.setAttribute('class', 'radio-button-container');
    options.forEach((optionValues) => {
      const labelValue = document.createElement('label');
      const dot = document.createElement('div')
      dot.setAttribute('class', 'dot');
      const labelText = document.createElement('span');
      const inputValue = document.createElement('input');
      inputValue.type = "radio";
      inputValue.name = name;
      inputValue.id = optionValues.value
      inputValue.value = optionValues.value;
      inputValue.checked = optionValues.value == value
      labelValue.htmlFor = optionValues.value;
      labelText.innerHTML = ['string', 'number'].includes(typeof optionValues) ? optionValues : optionValues.label;
      labelValue.appendChild(dot);
      labelValue.appendChild(labelText);
      radioButtons.appendChild(inputValue);
      radioButtons.appendChild(labelValue);
      loanFormContainer.appendChild(radioButtons);
      inputValue.addEventListener('change', e => {  
        setFieldValue(name, e.target.value)
      });
   });
   return radioButtons

  }



  const createDatePicker = ({ field, type }) => {
    const datePicker = document.createElement('div');
    datePicker.setAttribute('class', 'date-container');
    currentData.day = field.value ? field.value.split('-')[2] !== 'undefined' ? field.value.split('-')[2] : '' : '';
    currentData.month = field.value ? field.value.split('-')[1] !== 'undefined' ? field.value.split('-')[1] : '' : '';
    currentData.year = field.value ? field.value.split('-')[0] !== 'undefined' ? field.value.split('-')[0] : '' : '';

    const day = createSelect({ 
      id:"day",
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
      options: type === 'dateOfBirth' ? Array.from(Array(65).keys()).map(item => new Date().getFullYear() - dateData.birthDay.minAge - item) : Array.from(Array(65).keys()).map(item => new Date().getFullYear() - item), 
      value: currentData.year
    });
    datePicker.appendChild(day);
    datePicker.appendChild(month);
    datePicker.appendChild(year);
    loanFormContainer.appendChild(datePicker);
    if(currentData.currentField === "dateOfBirth") checkDate(dateData.birthDay.minAge,dateData.birthDay.maxAge)
    if(currentData.currentField === "incomeContractStartedAt") checkDate(dateData.jobStartDay.minAge,dateData.jobStartDay.maxAge)
    return datePicker;
  }

    const renderButtons = (data) => {
    const buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('class','button-container');
  
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');

    if(showButtonLabels){
      nextButton.innerText = translations[language].next;
      prevButton.innerText = translations[language].previous;
    }

    prevButton.setAttribute('class', 'arrow left');
    prevButton.addEventListener('click', debounce(async e => {
      if(loading) return
      if(typeof beforePrevious !== 'function' || await beforePrevious(data)){
        prevButton.setAttribute('class', 'lds-dual-ring');
        nextButton.setAttribute('disabled', true);
        render({ path: '/previous' });
      }
    }));
  
    buttonContainer.appendChild(prevButton);
    nextButton.setAttribute('class', 'arrow right');
    
    nextButton.addEventListener('click', debounce(async e => {

      if(loading) return

      if(typeof beforeNext !== 'function' || await beforeNext(data)){
        nextButton.setAttribute('class', 'lds-dual-ring');
        prevButton.setAttribute('disabled', true);
        render({ path: '/next' })

      }
    }))
    
    buttonContainer.appendChild(nextButton);
    loanFormContainer.appendChild(buttonContainer);
  }

  const renderForm = (field, path) => {
    loanFormContainer.innerHTML = '';
    const currentField = field.name;
    const failedValidation = currentField === field.lastField;
    if(currentData[field.name] === undefined) currentData = {};
    currentData.currentField = field.name;
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
        if(field.options.length <= 6) {
          input = createRadioButtons({ name: field.name, options: field.options, value: field.value })
          break;
        } 
        else {
          input = createSelect({ name: field.name, options: field.options, value: field.value });
          loanFormContainer.appendChild(input);
          break;
        }
      case 'boolean':
        input = createRadioButtons({ name: field.name, options: [{ label: translations[language].true, value: true }, { label: translations[language].false, value: false }], value: field.value });
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
    renderButtons(field);

  }


  const showSpinner = () => {
    loanFormContainer.innerHTML = '';
    const spinner = document.createElement('div');
    spinner.setAttribute('class', 'lds-dual-ring');
    spinner.style.margin = '20px auto';
  }
  
  const handleResponse = (data, path) => { 
    if(data.status === 'redirect'){
      if(typeof acceptCallback === 'function'){
        acceptCallback(data.redirectUrl)
      } else {
        sessionStorage.clear();
        window.location.href = data.redirectUrl;
      }
    } else if(data.status === 'rejected'){
      rejectCallback();
    } else {
      renderForm(data, path);
    }

  }
  
  const render = ({ path='/next', retries=0 }) => {
    
    if(path === '/next' && retries === 0) mapValuesForSending(currentData);

    const timeout = setTimeout(() => {
      const pleaseWait = document.createElement('div');
      pleaseWait.innerHTML = translations[language].pleaseWait;
      pleaseWait.style.textAlign = 'center';
      pleaseWait.style.padding = '20px';
      pleaseWait.style.color = '#6b6e77';
      loanFormContainer.appendChild(pleaseWait);
    }, 5000);

    loading = true

    fetch(`${apiEndpoint}/form${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...currentData, key })}).then(res => res.json()).then(data => {
      if(fieldCallback) fieldCallback(data);
      if(data.id) sessionStorage.setItem('applicationId', data.id);
      if(currentData.currentField === "monthlyIncome") sessionStorage.setItem('monthlyIncome', currentData.monthlyIncome);
      if(currentData.currentField === "dateOfBirth") sessionStorage.setItem('age', currentData.dateOfBirth);
      currentField = data
      clearTimeout(timeout);
      handleResponse(data, path);
      loading = false

    }).catch(err => {
      console.error(err);
      if(retries < 10) {
        setTimeout(() => {
          render({ path, retries: retries +1 });
        }, 3000)
      }
    });
  }


  const params = JSON.parse(sessionStorage.getItem('routeParams') || "{}");

  if(!key) {
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
        click: params && params.cid ? { connect: { id: params.cid } } : undefined,
        urlParams: JSON.stringify(params),
        referrer: sessionStorage.getItem('referrer') || 'direct'
      })
    }).then(res => res.json()).then(data => { 
      key = data.key;
      sessionStorage.setItem('applicationId', data.id);
      if(data.monthlyIncome) sessionStorage.setItem('monthlyIncome', data.monthlyIncome);
      if(data.dateOfBirth) sessionStorage.setItem('age', data.dateOfBirth);
      render({ path: '/next' });
    });
  } else {
    render({ path: '/next' });
  }

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

  if(typeof window !== 'undefined') {
    window._Bankos['render'] = render;
    window._Bankos['showSpinner'] = showSpinner;
    window._Bankos['updateField'] = updateField;
  }

  return { updateField, render, showSpinner }

}

const paramsGrab = async () => {
  if(location.pathname === '/') sessionStorage.setItem('referrer', document ? document.referrer : 'direct');
  if(window.location.search){
    let paramObj = Object.fromEntries(new URLSearchParams(window.location.search));
    if(window.location.search.indexOf('redirected=true') === -1 && paramObj.c && paramObj.p){ //Direct hit, new way to do this
      try {
        const { urlWithParams } = await fetch(`https://api.bankos.io/click${window.location.search}&noRedirect=true`).then(res => res.json());
        const url = new URL(urlWithParams);
        if(window.location.hostname !== url.hostname) window.location.href = urlWithParams;
        paramObj = Object.fromEntries(url.searchParams);
      } catch (err) {
        console.error(err);
      }
    }
    sessionStorage.setItem('routeParams', JSON.stringify(paramObj || {}));
  } 
}

const grabOffers = async () =>  {
  const params = JSON.parse(sessionStorage.getItem('routeParams') || '{}');
  const monthlyIncome = sessionStorage.getItem('monthlyIncome') || null
  const age = sessionStorage.getItem('age') || null

  return await fetch(`https://api.bankos.io/application/rejected/${process.env.NEXT_PUBLIC_SOURCE_KEY}?publisher=${params.utm_medium}&monthlyIncome=${monthlyIncome}&age=${age}`).then(res => res.json()).catch(err => []);
} 

if(typeof window !== 'undefined') {
    window._Bankos = {
      initForm: init,
      paramsGrab,
      grabOffers
    }
}