const removeitem_form = document.getElementById('removeitem_form')
const itemid = document.getElementById('itemid')
const errorElement = document.getElementById('error')

removeitem_form.addEventListener('submit',(e)=>{
    let messages = []
    if(/[a-zA-Z]/.test(itemid.value) || /[`!@#$%^&*()_+\-=\[\]{};':"\\|.,<>\/?~]/.test(itemid.value)){
        messages.push("Item ID should be a positive integer")
    }

    if (messages.length > 0 ){
        e.preventDefault()
        errorElement.innerText = messages.join('\n')
    }
   
})

