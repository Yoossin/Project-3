function button1()
{

    if (localStorage.clickcount) {
        localStorage.clickcount = Number(localStorage.clickcount)+1;
      } else {
        localStorage.clickcount = 1;
      }
      document.getElementById("demo").innerHTML = localStorage.clickcount;
    if(localStorage.clickcount % 2 == 0){
        StyleSheetID.setAttribute('href', '/Main1.css') 
        localStorage.setItem('CurrentStyle', 'Main1');
    }
    else{
        StyleSheetID.setAttribute('href', '/Main2.css')
        localStorage.setItem('CurrentStyle', 'Main2');
    }
}

function StyleChange(){
    PageStyle = localStorage.getItem('CurrentStyle');
    if(PageStyle == 'Main1'){
        StyleSheetID.setAttribute('href', '/Main1.css')
    }
    else if(PageStyle == 'Main2'){
        StyleSheetID.setAttribute('href', '/Main2.css')
    }
    else if (PageStyle == null){
        StyleSheetID.setAttribute('href', '/Main1.css')
    }
}

StyleChange();