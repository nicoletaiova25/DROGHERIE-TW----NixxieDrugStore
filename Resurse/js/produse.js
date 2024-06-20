// Variabila globala pentru a stoca ordinea initiala a produselor
let initialOrder = [];

window.addEventListener("load", function () {

    // Functie pentru eliminarea diacriticelor
    function removeDiacritics(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    // Update range display
    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    };

    // Filter products
    document.getElementById("filtrare").onclick = function () {
        if (validateInputs()) {
            filterProducts();
        }
    };

    // Reset filters
    document.getElementById("resetare").onclick = function () {
        if (confirm("Sunteti sigur ca doriti sa resetati filtrele?")) {
            resetFilters();
        }
    };

    // Sort products ascending
    document.getElementById("sortCrescNume").onclick = function () {
        if (validateInputs()) {
            sortProduse(true);
        }
    };

    // Sort products descending
    document.getElementById("sortDescrescNume").onclick = function () {
        if (validateInputs()) {
            sortProduse(false);
        }
    };

    // Sum prices of displayed products
    document.addEventListener('keydown', function (e) {
        if (e.altKey && e.key === 'c') {
            calculateSum();
        }
    });

    // Validate inputs
    function validateInputs() {
        const inpNume = document.getElementById("inp-nume");

        if (inpNume.value.match(/\d/)) {
            alert("Numele nu poate contine cifre.");
            inpNume.focus();
            return false;
        }

        if (!document.querySelector('input[name="gr_rad"]:checked')) {
            alert("Va rugam sa selectati un gramaj.");
            return false;
        }

        return true;
    }

    // Functie pentru actualizarea numarului total de produse afisate
    function updateTotalProductsCount() {
        const totalProductsCountElement = document.getElementById('products-count');
        if (totalProductsCountElement) {
            // Obtinem numarul total de produse afisate
            const totalProductsCount = document.querySelectorAll('.produs').length;
            // Actualizam textul elementului HTML cu numarul total de produse
            totalProductsCountElement.textContent = totalProductsCount;
        }
    }

    // Apelam functia pentru a actualiza numarul total de produse la incarcarea paginii
    updateTotalProductsCount();

    // Filter products
    function filterProducts() {
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();

        var radiogramaj = document.getElementsByName("gr_rad");
        let inpgramaj;
        for (let rad of radiogramaj) {
            if (rad.checked) {
                inpgramaj = rad.value;
                break;
            }
        }
        let mingramaj, maxgramaj;
        if (inpgramaj != "toate") {
            vCal = inpgramaj.split(":");
            mingramaj = parseInt(vCal[0]);
            maxgramaj = parseInt(vCal[1]);
        }

        var inpPret = parseInt(document.getElementById("inp-pret").value);

        var inpCateg = document.getElementById("inp-categorie").value.toLowerCase().trim();

        var origini = document.getElementById("inp-origine").value.toLowerCase().trim();

        var inpTipuri = document.getElementById("inp-tip").value.toLowerCase().trim();

        // Reducere checkbox values
        let reducereDa = document.getElementById("reducere-da").checked;
        let reducereNu = document.getElementById("reducere-nu").checked;

        let val_ingredient = document.getElementById("i_datalist").value;

        var origini2 = document.getElementById("i_sel_multiplu");
        let selectedOrigini = [];
        for (let option of origini2.selectedOptions) {
            selectedOrigini.push(option.value);
        }
        
        var inpDescriere = removeDiacritics(document.getElementById("inp-descriere").value.toLowerCase());

        var articole = document.getElementsByClassName("produs");
        let hasVisibleProducts = false;
        for (let art of articole) {
            art.style.display = "none";
            let nume = art.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            let cond1 = (nume.includes(inpNume));

            let gramaj = parseInt(art.getElementsByClassName("val-gramaj")[0].innerHTML);
            let cond2 = (inpgramaj == "toate" || (mingramaj <= gramaj && gramaj < maxgramaj));

            let pret = parseInt(art.getElementsByClassName("val-pret")[0].innerHTML);
            let cond3 = (pret >= inpPret);

            let categ = art.getElementsByClassName("val-categorie")[0].innerHTML.toLowerCase().trim();
            let cond4 = (inpCateg == "toate" || categ == inpCateg);

            let orig = art.getElementsByClassName("val-origine")[0].innerHTML.toLowerCase().trim();
            let cond8 = (origini == "toate" || orig == origini);

            let tipuri = art.getElementsByClassName("val-tip")[0].innerHTML.toLowerCase().trim();
            let cond9 = (inpTipuri == "toate" || tipuri == inpTipuri);

            // Conditie pentru reducere
            let prod_reducere = art.getElementsByClassName("val-reducere")[0].innerHTML.toLowerCase();
            let cond10 = (
                (reducereDa && prod_reducere === "da") || 
                (reducereNu && prod_reducere === "nu") ||
                (!reducereDa && !reducereNu)
            );

            let descriere = removeDiacritics(art.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase());
            let cond6 = (inpDescriere === "" || descriere.includes(inpDescriere));

            let prod_ingredient = art.getElementsByClassName("val-ingredient")[0].innerHTML;
            let cond7 = (val_ingredient === "" || prod_ingredient.includes(val_ingredient));

            let cond12 = selectedOrigini.length === 0 || selectedOrigini.some(origini => orig.includes(origini));

            if (cond1 && cond2 && cond3 && cond4 && cond6 && cond7 && cond8 && cond9 && cond10 && cond12) {
                art.style.display = "block";
                hasVisibleProducts = true;
                updateTotalProductsCount();
            }
        }

        let noProductsMessage = document.getElementById("no-products");
    if (hasVisibleProducts) {
        noProductsMessage.style.display = "none";
    } else {
        noProductsMessage.style.display = "block";
    }
    updateTotalProductsCount();
    }

    // Reset filters
    function resetFilters() {
        document.getElementById("inp-nume").value = "";
        document.getElementById("i_rad4").checked = true;
        document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
        document.getElementById("inp-categorie").value = "toate";
        document.getElementById("inp-descriere").value = "";
        document.getElementById("infoRange").innerHTML = "(0)";
        document.getElementById("i_datalist").value = "";
        document.getElementById("inp-origine").value="toate";
        document.getElementById("inp-tip").value = "toate";
        document.getElementById("reducere-da").checked = false;
        document.getElementById("reducere-nu").checked = false;
        document.getElementById("i_sel_multiplu").value = "";
        // Restaurarea ordinii initiale
        const grid = document.querySelector(".grid-produse");
        initialOrder.forEach(prod => grid.appendChild(prod));
        filterProducts();
    };

    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
        filterProducts();
    }

    document.getElementById("reducere-da").onchange = function (){
        filterProducts();
    }

    document.getElementById("reducere-nu").onchange = function (){
        filterProducts();
    }

    document.getElementById("inp-nume").onchange = function () {
        filterProducts();
    }

    document.getElementById("inp-descriere").onchange = function (){
        filterProducts();
    }

    document.getElementById("inp-categorie").onchange = function () {
        filterProducts();
    }

    document.getElementById("inp-origine").onchange = function () {
        filterProducts();
    }

    document.getElementById("inp-tip").onchange = function () {
        filterProducts();
    }

    document.getElementsByName("gr_rad").forEach(function (radio) {
        radio.onchange = function() {
            filterProducts();
        }
    });

    document.getElementById("i_datalist").onchange = function() {
        filterProducts();
    }

    // Sort products
    function sortProduse(asc) {
        var grid = document.querySelector(".grid-produse");
        var produse = Array.from(grid.children);
        produse.sort(function (a, b) {
            let pretA = parseInt(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pretB = parseInt(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pretA === pretB) {
                let numeA = a.getElementsByClassName("val-nume")[0].innerHTML;
                let numeB = b.getElementsByClassName("val-nume")[0].innerHTML;
                return asc ? numeA.localeCompare(numeB) : numeB.localeCompare(numeA);
            }
            return asc ? pretA - pretB : pretB - pretA;
        });
        for (let prod of produse) {
            grid.appendChild(prod);
        }
    }

    // Calculate sum of prices
    function calculateSum() {
        let articole = document.querySelectorAll(".produs");
        let suma = 0;
        for (let art of articole) {
            if (art.style.display !== "none") {
                suma += parseInt(art.getElementsByClassName("val-pret")[0].innerHTML);
            }
        }
        alert("Suma preturilor produselor afisate este: " + suma);
    }

    const textarea = document.getElementById("inp-descriere");

    function validare(textarea) {
        let val_descriere = textarea.value.toLowerCase();
        var produse = document.getElementsByClassName("produs");
        let isInvalid = true; // Flag to track validation result

        for (let prod of produse) {
            let prod_descriere = prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();
            if (prod_descriere.includes(val_descriere)) {
                isInvalid = false;
                break; // Exit the loop if a match is found
            }
        }

        if (isInvalid) {
            textarea.classList.add("is-invalid"); // Add the is-invalid class
        } else {
            textarea.classList.remove("is-invalid"); // Remove the is-invalid class
        }
    }

    // Event listener to trigger validation on textarea input
    textarea.addEventListener("input", function () {
        validare(textarea);
    });




    const grid = document.querySelector(".grid-produse");
    initialOrder = Array.from(grid.children);
});