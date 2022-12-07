const employeename = document.getElementById('employeename')
const employeestatus = document.getElementById('employeestatus')
const form = document.getElementById('updateemployee_form')
const employeeid = document.getElementsByName('employeeid')
const errorElement  = document.getElementById('error')
var letters = /^[A-Za-z]+$/;

form.addEventListener('submit',(e)=>{
    
    
    let messages = []

    if(/[a-zA-Z]/.test(employeeid.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(employeeid.value)){
        messages.push("Employee ID should be a positive integer")
    }

    if(!(/^[a-zA-Z]+$/.test(employeename.value))){
        messages.push("Enter a valid name")
    }
    
    if(employeestatus.value != "Employee" && employeestatus.value != "Manager"){
        messages.push("The status can be either Employee or Manager")
    }

    if (messages.length > 0 ){
        e.preventDefault()
        errorElement.innerText = messages.join('\n')
    }
})