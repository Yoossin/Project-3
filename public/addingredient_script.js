const addingredient_form = document.getElementById('addingredient_form')
const ingredientname = document.getElementById('ingredientname')
const ingredientunit = document.getElementById('ingredientunit')
const errorElement = document.getElementById('error')

addingredient_form.addEventListener('submit',(e)=>{
    
    let messages = []
    if(!(/^[a-zA-Z]+$/.test(ingredientname.value))){
        messages.push("Enter a valid ingredient name")
    }
    
    if(!(/Lbs/.test(ingredientunit.value) || /Gal/.test(ingredientunit.value) || /Unit/.test(ingredientunit.value))){
        messages.push("The ingredient unit should be Lbs or Gal or Unit")
    }

    
    
    if (messages.length > 0 ){
        e.preventDefault()
        errorElement.innerText = messages.join('\n')
    }
})
