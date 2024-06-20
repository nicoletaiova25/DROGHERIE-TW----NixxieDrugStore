
let darktema= localStorage.getItem("darktema"); //orimeste cheia asociata darktema
let bluetema =localStorage.getItem("bluetema"); //salvez tema

if (darktema) {
    document.body.classList.add("dark"); //adauga clasa css daca exista tema
}
if (bluetema){
    document.body.classList.add("blue"); //adauga clasa css daca exista tema
}

//folosim addEvent etc ca sa mearga pentru toate paginile 
//onload se declanseaza de abia dupa ce-si instaleaza tot ce are nevoie , si isi da overwrite pe produse 
//de aceea folosim addEventListener 
window.addEventListener("load", function () {
    //cazul in care doresc tema dark
    document.getElementById("darktema").onclick = function () {
        if (document.body.classList.contains("blue")){  //daca la momentul click-ului am blue
            document.body.classList.remove("blue") //il elimina
            localStorage.removeItem("bluetema"); //elimina efectul temei
            document.body.classList.add("dark") //adauga clasa dark
            localStorage.setItem("darktema", "dark"); //marcheaza tema dark 
        }
        //in caz contrar , setez tema optata 
        else{
            document.body.classList.add("dark")
            localStorage.setItem("darktema", "dark");
        }
    }
    //in cazul in care doresc tema blue 
    document.getElementById("bluetema").onclick = function () {
        //daca in momentul click-ului am tema dark se elimana 
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark")
            localStorage.removeItem("darktema");
            //adauga tema blue
            document.body.classList.add("blue")
            localStorage.setItem("bluetema", "blue");
        }
        //in caz contrar setez tema optata 
        else {
            document.body.classList.add("blue")
            localStorage.setItem("bluetema", "blue");
        }
    }
    //tema normaltheme e tema implicita 
    //astfel daca exista tema dark / blue in momentul click-ului se elimina
    document.getElementById("normaltheme").onclick = function () {
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark")
            localStorage.removeItem("darktema");
        }
        else if (document.body.classList.contains("blue")){
            document.body.classList.remove("blue")
            localStorage.removeItem("bluetema");
        }
    }
})