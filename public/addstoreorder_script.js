const addstoreorder_form = document.getElementById('addstoreorder_form')
const price = document.getElementById('price')
const employeeid = document.getElementById('employeeid')
const amounts  = document.getElementById('amounts')
const ingredientids = document.getElementById('ingredientids')
const prices = document.getElementById('prices')
const errorElement = document.getElementById('error')

addstoreorder_form.addEventListener('submit',(e)=>{
    
    let messages = []

    if(/[a-zA-Z]/.test(price.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|<>\/?~]/.test(price.value)){
        messages.push("Price should be positive number")
    }


    if(/[a-zA-Z]/.test(employeeid.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|.,<>\/?~]/.test(employeeid.value)){
        messages.push("Employee ID should be a positive integer")
    }
    
    if(/[a-zA-Z]/.test(amounts.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|<>\/?~]/.test(amounts.value)){
        messages.push("Amounts should be a list of comma separated positive numbers")
    }

    if(/[a-zA-Z]/.test(ingredientids.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|.<>\/?~]/.test(ingredientids.value)){
        messages.push("Ingredient IDs should be a list of comma separated positive integers")
    }

    if(/[a-zA-Z]/.test(prices.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|<>\/?~]/.test(prices.value)){
        messages.push("Prices should be a list of comma separated positive numbers")
    }

    
    if (messages.length > 0 ){
        e.preventDefault()
        errorElement.innerText = messages.join('\n')
    }
})
