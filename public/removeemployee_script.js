const removeemployee_form = document.getElementById('removeemployee_form')
const employeeid = document.getElementById('employeeid')
const errorElement = document.getElementById('error')

removeemployee_form.addEventListener('submit',(e)=>{
    let messages = []
    if(/[a-zA-Z]/.test(employeeid.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|.,<>\/?~]/.test(employeeid.value)){
        messages.push("Item ID should be a positive integer")
    }

    if (messages.length > 0 ){
        e.preventDefault()
        errorElement.innerText = messages.join('\n')
    }
   
})

