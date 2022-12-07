const updateitem_form = document.getElementById('updateitem_form')
const itemname = document.getElementById('itemname')
const itemprice = document.getElementById('itemprice')
const itemid  = document.getElementById('itemid')
const onmenu = document.getElementById('onmenu')
const errorElement = document.getElementById('error')

updateitem_form.addEventListener('submit',(e)=>{
    
    let messages = []
    if(!(/^[a-zA-Z]+$/.test(itemname.value))){
        messages.push("Enter a valid item name")
    }
    
    if(/[a-zA-Z]/.test(itemprice.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/.test(itemprice.value)){
        messages.push("The price should be a positive number")
    }

    if(/[a-zA-Z]/.test(itemid.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(itemid.value)){
        messages.push("Item ID should be a positive integer")
    }
    
    if (messages.length > 0 ){
        e.preventDefault()
        errorElement.innerText = messages.join('\n')
    }
})

