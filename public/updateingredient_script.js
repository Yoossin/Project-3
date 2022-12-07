const updateingredient_form = document.getElementById('updateingredient_form')
const ingredientname = document.getElementById('ingredientname')
const ingredientstock = document.getElementById('ingredientstock')
const ingredientid  = document.getElementById('ingredientid')
const ingredientstockstatus = document.getElementById('ingredientstockstatus')
const ingredientunit = document.getElementById('ingredientunit')
const errorElement = document.getElementById('error')

updateingredient_form.addEventListener('submit',(e)=>{
    
    let messages = []
    if(!(/^[a-zA-Z]+$/.test(ingredientname.value))){
        messages.push("Enter a valid ingredient name")
    }
    
    if(/[a-zA-Z]/.test(ingredientstock.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/.test(ingredientstock.value)){
        messages.push("The stock should be a positive number")
    }

    if(/[a-zA-Z]/.test(ingredientid.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(ingredientid.value)){
        messages.push("Ingredient ID should be a positive integer")
    }

    if(!(/Lbs/.test(ingredientunit.value) || /Gal/.test(ingredientunit.value) || /Unit/.test(ingredientunit.value))){
        messages.push("The ingredient unit should be Lbs or Gal or Unit")
    }

    if(!(/High Stock/.test(ingredientstockstatus.value) || /Stocked/.test(ingredientstockstatus.value) || /Not Stocked/.test(ingredientstockstatus.value))){
        messages.push("Stock status should be High Stock or Stocked or Not Stocked")
    }
    
    if (messages.length > 0 ){
        e.preventDefault()
        errorElement.innerText = messages.join('\n')
    }
})

