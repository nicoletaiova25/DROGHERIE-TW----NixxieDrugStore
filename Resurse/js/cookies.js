
// //setCookie("a",10, 1000)
// function setCookie(nume, val, timpExpirare){//timpExpirare in milisecunde
//     d=new Date();
//     d.setTime(d.getTime()+timpExpirare)
//     document.cookie=`${nume}=${val}; expires=${d.toUTCString()}`;
// }

// function getCookie(nume){
//     vectorParametri=document.cookie.split(";") // ["a=10","b=ceva"]
//     for(let param of vectorParametri){
//         if (param.trim().startsWith(nume+"="))
//             return param.split("=")[1]
//     }
//     return null;
// }

// function deleteCookie(nume){
//     console.log(`${nume}; expires=${(new Date()).toUTCString()}`)
//     document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}`;
// }


// window.addEventListener("load", function(){
//     if (getCookie("acceptat_banner")){
//         document.getElementById("banner").style.display="none";
//     }

//     this.document.getElementById("ok_cookies").onclick=function(){
//         setCookie("acceptat_banner",true,60000);
//         document.getElementById("banner").style.display="none"
//     }
// })
// script.js

// script.js

// script.js

function setCookie(nume, val, timpExpirare) {
    let d = new Date();
    d.setTime(d.getTime() + timpExpirare);
    document.cookie = `${nume}=${val}; expires=${d.toUTCString()}; path=/`;
}

function getCookie(nume) {
    let vectorParametri = document.cookie.split(";"); // ["a=10","b=ceva"]
    for (let param of vectorParametri) {
        if (param.trim().startsWith(nume + "="))
            return param.split("=")[1];
    }
    return null;
}

function deleteCookie(nume) {
    document.cookie = `${nume}=; expires=${(new Date(0)).toUTCString()}; path=/`;
}

function deleteAllCookies() {
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.trim().split("=")[0] + '=; expires=' + new Date(0).toUTCString() + '; path=/';
    });
}

window.addEventListener("load", function () {
    if (getCookie("acceptat_banner")) {
        document.getElementById("banner").style.display = "none";
    } else {
        setTimeout(() => {
            document.getElementById("banner").style.visibility = "visible";
        }, 5000); // Allow time for the animation to start
    }

    document.getElementById("ok_cookies").onclick = function () {
        setCookie("acceptat_banner", true, 10000); // 10 seconds //7 * 24 * 60 * 60 * 1000 for a week
        document.getElementById("banner").style.display = "none";
    }

    document.getElementById("delete_cookies").onclick = function () {
        deleteAllCookies();
        alert("All cookies have been deleted.");
    }

    document.getElementById("delete_acceptat_banner_cookie").onclick = function () {
        deleteCookie("acceptat_banner");
        alert("Cookie 'acceptat_banner' has been deleted.");
    }

    // Set additional cookie for the last visited page
    setCookie("ultima_pagina", window.location.href, 7 * 24 * 60 * 60 * 1000); // 1 week

    const ultimaPagina = getCookie("ultima_pagina");
    if (ultimaPagina) {
        document.getElementById("ultima_pagina_accesata").textContent = "Ultima pagină accesată: " + ultimaPagina;
    }
});

