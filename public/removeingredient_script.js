const removeingredient_form = document.getElementById('removeingredient_form')
const ingredientid = document.getElementById('ingredientid')
const errorElement = document.getElementById('error')

removeingredient_form.addEventListener('submit',(e)=>{
    let messages = []
    if(/[a-zA-Z]/.test(ingredientid.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|.,<>\/?~]/.test(ingredientid.value)){
        messages.push("Ingredient ID should be a positive integer")
    }

    if (messages.length > 0 ){
        e.preventDefault()
        errorElement.innerText = messages.join('\n')
    }
   
})

