const additem_form = document.getElementById('additem_form')
const itemname = document.getElementById('itemname')
const itemprice = document.getElementById('itemprice')
const ingredientids  = document.getElementById('ingredientids')
const errorElement = document.getElementById('error')

additem_form.addEventListener('submit',(e)=>{
    
    let messages = []
    if(!(/^[a-zA-Z]+$/.test(itemname.value))){
        messages.push("Enter a valid ingredient name")
    }
    
    if(/[a-zA-Z]/.test(itemprice.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/.test(itemprice.value)){
        messages.push("The price should be a positive number")
    }

    if(/[a-zA-Z]/.test(ingredientids.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|.<>\/?~]/.test(ingredientids.value)){
        messages.push("Ingredient IDs should be a list of comma separated integers")
    }
    
    if (messages.length > 0 ){
        e.preventDefault()
        errorElement.innerText = messages.join('\n')
    }
})

