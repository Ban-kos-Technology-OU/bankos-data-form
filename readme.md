**Bankos data form**

Installation

    npm install @bankos/bankos-data-form

or 

    yarn add @bankos/bankos-data-form

or add the script to the page using script tag

    <script src="https://cdn.jsdelivr.net/npm/@bankos/bankos-data-form" defer></script>


Usage

    const  fields = {    
	    sourceKey:  "1234", //This detemines the fieds that will be shown
	    amount:  100,
	    period:  31
    }
    
    const  rejectCallback = () => { // Callback when the application is rejected
	    window.location.href = "https://www.google.com" 	
    }      
    
    const  fieldCallback = (data) => { // Callback when the field is advanced
	    console.log(data);
    }      
    
    // updateField function can be called externally to update fields like amount or period
    const { updateField } = window.initForm({
	    fields,
	    rejectCallback,
	    fieldCallback,
	    language:  'ES', // Form language
	    apiEndpoint:  "https://api.staging.bankos.io"
    });

