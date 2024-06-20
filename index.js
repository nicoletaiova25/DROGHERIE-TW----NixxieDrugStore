// Importarea modulului express pentru a crea si gestiona serverul
const express = require("express");
// Importarea modulului fs pentru manipularea fisierelor
const fs = require('fs');
// Importam modulul 'path' pentru a lucra cu caile de fisiere si directoare
const path = require ('path');
// Importa modulul 'sass' pentru a putea compila fisierele SCSS in CSS
const sass = require('sass');
// Importa modulul 'sharp' pentru a manipula si edita imagini intr-un mod eficient
const sharp = require('sharp');

const ejs = require('ejs');


const AccesBD = require("./module_proprii/accesbd.js"); //unde este el fata de index.js

const formidable = require("formidable");
const {Utilizator} = require("./module_proprii/utilizator.js")
const session = require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");

const Client = require ('pg').Client;

var client = new Client({
    database: "drogherie",
    user: "nixxie",
    password: "nixxie",
    host: "localhost",
    port: 5432
});
client.connect();

/*client.query("select * from articole", function(err, rez){
    console.log(rez);
})*/

// Initializarea aplicatiei Express
const app = express();

// Obiect global pentru a stoca erorile si imaginile
const obGlobal = {
    obErori: null,
    obImagini: null,
    folderCss: path.join(__dirname, "Resurse/css"),
    folderScss: path.join(__dirname, "Resurse/scss"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu: []
}

// Afisarea cailor si directoarelor de lucru
console.log("Folder proiect", __dirname);//returneaza calea directorului in care se afla fisierul curent si nu depinde de locul de unde este rulat scriptul
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());//returneaza directorul de lucru al procesorului curent, din care a fost lansat procesul node.js
//__dirname ofera calea absoluta catre directorul fisierului curent
//process.cwd() furnizeaza directorul de lucru al procesului node.js care poate fi relativ la locatia de unde a fost pornit scriptul
//__filename ofera calea absoluta catre fisierul curent in care este utilizata

// Vectorul de foldere ce trebuie create
const vectorFoldere = ["temp", "temp1", "backup", "poze_uploadate"];

// Crearea foldereleor din vectorul de foldere
for (let folder of vectorFoldere) {
    let caleFolder = __dirname + "/" + folder;
    if (!fs.existsSync(caleFolder))
        fs.mkdirSync(caleFolder);
}

//un obiect special ca sa memorez datele utilizatorului in sesiune =>session
app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));

app.use("/*", function(req, res, next){
    res.locals.Drepturi = Drepturi;
    if (req.session.utilizator){
        req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator);
    }
    next();
})
// Setarea motorului de vizualizare EJS
app.set("view engine", "ejs");

// Middleware pentru servirea resurselor statice din directorul "Resurse"
app.use("/Resurse", express.static(__dirname + "/Resurse"));
app.use("/poze_uploadate", express.static(__dirname+"/poze_uploadate"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

// Middleware pentru gestionarea cererilor catre fisierul favicon.ico
app.get("/favicon.ico", function (req, res) {
    res.sendFile(__dirname + "/Resurse/ico/favicon.ico");
});

// Middleware pentru setarea opțiunilor de meniu în `res.locals`
app.use((req, res, next) => {
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    next();
});

// Rutele pentru paginile principale
app.get(["/", "/index", "/home"], function (req, res) {
    res.render("pagini/index", {ip: req.ip, imagini:obGlobal.obImagini.imagini});
});



//produse

app.get("/produse", function(req, res) {
    client.query("SELECT DISTINCT categorie_produse AS unnest FROM articole", function(err, rezCategorii) {
        if (err) {
            console.log(err);
            afiseazaEroare(res, 2);
        } else {
            obGlobal.optiuniMeniu = rezCategorii.rows;
            client.query("SELECT DISTINCT tip_origine AS unnest FROM articole", function(err, rezOrigini) {
                if (err) {
                    console.log(err);
                    afiseazaEroare(res, 2);
                } else {
                    client.query(
                        "SELECT MIN(pret) AS min_price, MAX(pret) AS max_price FROM articole",
                        function(err, rezPret) {
                            if (err) {
                                console.log(err);
                                afiseazaEroare(res, 2);
                            } else {
                                client.query("SELECT DISTINCT tipuri_produs AS unnest FROM articole", function(err, rezTipuri) {
                                    if (err) {
                                        console.log(err);
                                        afiseazaEroare(res, 2);
                                    } else {
                                        client.query("SELECT DISTINCT UNNEST(ingrediente) AS unnest FROM articole", function(err, rezIngrediente) {
                                            if (err) {
                                                console.log(err);
                                                afiseazaEroare(res, 2);
                                            } else {
                                                client.query("SELECT * FROM articole", function(err, rezProduse) {
                                                    if (err) {
                                                        console.log(err);
                                                        afiseazaEroare(res, 2);
                                                    } else {
                                                        res.render("pagini/produse", { 
                                                            produse: rezProduse.rows, 
                                                            optiuni: rezCategorii.rows, 
                                                            origini: rezOrigini.rows, 
                                                            tipuri: rezTipuri.rows,
                                                            minPrice: rezPret.rows[0].min_price,
                                                            maxPrice: rezPret.rows[0].max_price,
                                                            ingrediente: rezIngrediente.rows 
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    );     
                }
            });
        }
    });
});


//aici se inchide app.get produse

////produs
app.get("/produs/:id" ,function(req, res){
    client.query(`select * from articole where id=${req.params.id}`, function(err, rez){
        if(err){
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else{
            res.render("pagini/produs", {prod: rez.rows[0]} )
        }
      
    }) //aici se inchide client.query

})//aici se inchide app.get produs


/////////////// UTILIZATOR
app.post("/inregistrare", function (req, res) {
    var username;
    var poza;
    var formular = new formidable.IncomingForm();
    formular.parse(req, function (err, campuriText, campuriFisier) {
        console.log("Inregistrare:", campuriText);
        console.log(campuriFisier);
        console.log(poza, username);
        var eroare = "";

        var utilizNou = new Utilizator();
         // Validare lungime parola
         if (campuriText.parola[0].length < 6) {
            eroare += "Parola trebuie să conțină cel puțin 6 caractere. ";
        }

        // Validare complexitate parola
        if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d.*\d)(?=.*[.!@#$%^&*()])/.test(campuriText.parola[0])) {
            eroare += "Parola trebuie să conțină minim o literă mare, o literă mică, 2 cifre și un caracter special. ";
        }

        // Validare format telefon
        if (!/^(\+\d{1,2})?0\d{9}$/.test(campuriText.telefon[0])) {
            eroare += "Numărul de telefon trebuie să înceapă cu '+', să conțină doar cifre după acesta și să aibă minim 10 cifre. ";
        }

        // Validare username
        if (!/^[A-Za-z0-9#_./]{4,}$/.test(campuriText.username[0])) {
            eroare += "Username-ul poate conține doar litere, cifre și simbolurile #_./ și trebuie să aibă minim 4 caractere. ";
        }

        // Validare email (verificare simplă a formatului)
        if (!/\S+@\S+\.\S+/.test(campuriText.email[0])) {
            eroare += "Adresa de email nu este într-un format corect. ";
        }
          
        try {
            if (!campuriText.nume || !campuriText.username || !campuriText.email || 
                !campuriText.prenume || !campuriText.parola || !campuriText.culoare_chat || 
                !campuriText.data_nasterii || !campuriText.telefon) {
                throw new Error("Toate câmpurile sunt obligatorii!");
            }

            utilizNou.setareNume = campuriText.nume[0];
            utilizNou.setareUsername = campuriText.username[0];
            utilizNou.email = campuriText.email[0];
            utilizNou.prenume = campuriText.prenume[0];
            utilizNou.parola = campuriText.parola[0];
            utilizNou.culoare_chat = campuriText.culoare_chat[0];
            utilizNou.poza = poza;
            utilizNou.data_nasterii = campuriText.data_nasterii[0];
            utilizNou.telefon = campuriText.telefon[0];

            Utilizator.getUtilizDupaUsername(campuriText.username[0], {}, function (u, parametru, eroareUser) {
                if (eroareUser == -1) { // Username not found in DB
                    utilizNou.salvareUtilizator();
                } else {
                    eroare += "Mai exista username-ul";
                }

                if (!eroare) {
                    res.render("pagini/inregistrare", { raspuns: "Inregistrare cu succes!" });
                } else {
                    res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
                }
            });

        } catch (e) {
            console.error("Eroare în timpul înregistrării:", e);
            eroare += "Eroare site; reveniti mai tarziu";
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
        }
    });

    formular.on("field", function (nume, val) {
        console.log(`--- ${nume}=${val}`);
        if (nume == "username") {
            username = val;
        }
    });

    formular.on("fileBegin", function (nume, fisier) {
        console.log("fileBegin");
        console.log(nume, fisier);
        var folderUser = path.join(__dirname, "poze_uploadate", username);
        if (!fs.existsSync(folderUser)) {
            fs.mkdirSync(folderUser);
        }
        fisier.filepath = path.join(folderUser, fisier.originalFilename);
        poza = fisier.originalFilename;
        console.log("fileBegin:", poza);
        console.log("fileBegin, fisier:", fisier);
    });

    formular.on("file", function (nume, fisier) {
        console.log("file");
        console.log(nume, fisier);
    });
});
///aici se termina inregistrarea

app.post("/login", function(req, res) {
    console.log("ceva");
    var formular = new formidable.IncomingForm();

    formular.parse(req, function(err, campuriText, campuriFisier) {
        var parametriCallback = {
            req: req,
            res: res,
            parola: campuriText.parola[0]
        };
        Utilizator.getUtilizDupaUsername(campuriText.username[0], parametriCallback,
            function(u, obparam) { // proceseazaUtiliz
                if (u) {
                    let parolaCriptata = Utilizator.criptareParola(obparam.parola);
                    if (u.parola === parolaCriptata && u.confirmat) {
                        u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "";
                        obparam.req.session.utilizator = u;
                        obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
                        obparam.res.redirect("/index");
                    } else {
                        console.log("Eroare logare");
                        obparam.req.session.mesajLogin = "Date logare incorecte sau nu a fost confirmat mailul!";
                        obparam.res.redirect("/index");
                    }
                } else {
                    console.log("Eroare logare: Utilizator inexistent");
                    obparam.req.session.mesajLogin = "Utilizatorul nu există!";
                    obparam.res.redirect("/index");
                }
            });
    });
});
 //aici se termina login

app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        afisareEroare(res,403,)
        res.render("pagini/eroare_generala",{text:"Nu sunteti logat."});
        return;
    }
    var formular= new formidable.IncomingForm();
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola[0]);
 
        AccesBD.getInstanta().updateParametrizat(
            {tabel:"utilizatori",
            campuri:["nume","prenume","email","culoare_chat", "telefon","data_nasterii"],
            valori:[
                `${campuriText.nume[0]}`,
                `${campuriText.prenume[0]}`,
                `${campuriText.email[0]}`,
                `${campuriText.culoare_chat[0]}`,
                `${campuriText.telefon[0]}`,
                `${campuriText.data_nasterii[0]}`],
            conditiiAnd:[`parola='${parolaCriptata}'`,
                         `username = '${campuriText.username[0]}'`
                        ]
        },          
        function(err, rez){
            if(err){
                console.log(err);
                afisareEroare(res,2);
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{            
                //actualizare sesiune
                console.log("ceva");
                req.session.utilizator.nume= campuriText.nume[0];
                req.session.utilizator.prenume= campuriText.prenume[0];
                req.session.utilizator.email= campuriText.email[0];
                req.session.utilizator.culoare_chat= campuriText.culoare_chat[0];
                req.session.utilizator.telefon = campuriText.telefon[0];
                req.session.utilizator.data_nasterii = campuriText.data_nasterii[0];
                res.locals.utilizator=req.session.utilizator;
            }
 
 
            res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});
 
        });
       
 
    });
});

// app.get("/cod/:username/:token",function(req,res){
//     console.log(req.params);
//     try {
//         //primeste username-ul , o functie callback ,un obiect
//         //vrem sa actualizam acest utilizator 
//         Utilizator.getUtilizDupaUsername(req.params.username,{res:res,token:req.params.token} ,function(u,obparam){
//             AccesBD.getInstanta().update(
//                 {tabel:"utilizatori",
//                 campuri:{confirmat:'true'}, 
//                 conditiiAnd:[`cod='${obparam.token}'`]}, 
//                 //cod-ul egal cu cel din token 
//                 //daca s-a update cu succes , intra in confirmare ejs 
//                 function (err, rezUpdate){
//                     if(err || rezUpdate.rowCount==0){
//                         console.log("Cod:", err);
//                         afisareEroare(res,3);
//                     }
//                     else{
//                         res.render("pagini/confirmare.ejs");
//                     }
//                 })
//         })
//     }
//     catch (e){
//         console.log(e);
//         renderError(res,2);
//     }
// })

// app.get("/cod/:token1-:token2/:username", async function (req, res) {
//     let { token1, token2, username } = req.params;
//     username = username.toLowerCase(); // convert username to lowercase

//     try {
//         Utilizator.getUtilizDupaUsername(username, { res: res, token: `${token1}-${token2}` }, function (u, obparam) {
//             AccesBD.getInstanta().update({
//                 tabel: "utilizatori",
//                 campuri: { confirmat: 'true' },
//                 conditiiAnd: [`username='${username}'`, `cod='${obparam.token}'`]
//             }, function (err, rezUpdate) {
//                 if (err || rezUpdate.rowCount == 0) {
//                     console.log("Cod:", err);
//                     res.render("pagini/confirmare.ejs");
//                 } else {
//                     res.render("pagini/confirmare.ejs");
//                 }
//             });
//         });
//     } catch (e) {
//         console.log(e);
//         res.render("pagini/confirmare.ejs");
//     }
// });

app.get("/cod/:token1-:token2/:username", async function (req, res) {
    let { token1, token2, username } = req.params;
    username = username.toLowerCase(); // convert username to lowercase

    try {
        let utilizator = await Utilizator.getUtilizDupaUsernameAsync(username);

        if (utilizator && utilizator.cod === `${token1}-${token2}`) {
            // Update the user as confirmed
            AccesBD.getInstanta(Utilizator.tipConexiune).update({
                tabel: Utilizator.tabel,
                campuri: { confirmat: true },
                conditiiAnd: [`username='${username}'`]
            }, function (err, rez) {
                if (err) {
                    console.log(err);
                    res.send("Eroare la confirmarea contului. Te rugăm să încerci din nou.");
                } else {
                    res.send("Contul tău a fost confirmat cu succes!");
                }
            });
        } else {
            res.send("Link de confirmare invalid sau expirat.");
        }
    } catch (e) {
        console.log(e);
        res.send("Eroare la confirmarea contului. Te rugăm să încerci din nou.");
    }
});


app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pagini/logout");
});

const nodemailer = require("nodemailer");

app.post("/delete_account", function(req, res) {
    let formular = new formidable.IncomingForm();
    
    formular.parse(req, function(err, campuriText, campuriFisier) {
        let parola = campuriText.parola[0];

        if (req.session && req.session.utilizator) {
            let utilizator = req.session.utilizator;

            let parolaCriptata = Utilizator.criptareParola(parola);

            if (utilizator.parola === parolaCriptata) {
                // Delete the user from the database
                AccesBD.getInstanta().delete({
                    tabel: "utilizatori",
                    conditiiAnd: [`username='${utilizator.username}'`]
                }, function(err, rezDelete) {
                    if (err || rezDelete.rowCount == 0) {
                        console.log("Eroare la ștergerea contului:", err);
                        res.redirect("/profil"); // Redirect to profile with an error message (optional)
                    } else {
                        // Send farewell email
                        let transp = nodemailer.createTransport({
                            service: "gmail",
                            secure: false,
                            auth: {
                                user: Utilizator.emailServer,
                                pass: "tfrgjumfjsaebixa" // Update with the real password or use environment variables
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });

                        let mailOptions = {
                            from: Utilizator.emailServer,
                            to: utilizator.email,
                            subject: "La revedere",
                            text: `Ne pare rău să te vedem plecând, ${utilizator.username}.`,
                            html: `<p>Ne pare rău să te vedem plecând, ${utilizator.username}.</p>`
                        };

                        transp.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log("Eroare la trimiterea emailului:", error);
                            } else {
                                console.log("Email trimis:", info.response);
                            }
                        });

                        // Destroy the session
                        req.session.destroy(function(err) {
                            if (err) {
                                console.log("Eroare la distrugerea sesiunii:", err);
                            }
                            res.redirect("/index"); // Redirect to the home page after account deletion
                        });
                    }
                });
            } else {
                console.log("Parola incorectă");
                res.redirect("/profil"); // Redirect to profile with an error message (optional)
            }
        } else {
            res.redirect("/login"); // Redirect to login if the user is not logged in
        }
    });
});


// Ruta pentru a trimite un mesaj static
app.get("/cerere", function (req, res) {
    res.send("<b>Hello</b> <span style='color:red'>world!</span>");
});

// Ruta pentru a trimite data curenta
app.get("/data", function (req, res, next) {
    res.write("Data: ");
    next();
});

// Gestionarea rutei /data pentru afisarea datei curente
app.get("/data", function (req, res) {
    res.write("" + new Date());
    res.end();
});

// Ruta pentru calcularea si trimiterea sumei a doua numere primite ca parametri in URL
app.get("/suma/:a/:b", function (req, res) {
    var suma = parseInt(req.params.a) + parseInt(req.params.b)
    res.send("" + suma);
});

// Gestionarea cererilor pentru fisiere .ejs
app.get("/*.ejs", function (req, res) {
    afiseazaEroare(res, 400);
});


app.get(new RegExp("^Resurse\/[A-Za-z\/0-9]*\/$"), function(req, res){
    afisareEroare(res,403);
    
});

// Gestionarea cererilor pentru orice alt tip de fisier sau ruta
app.get("/*", function (req, res) {
    try {
        // Afisarea caii accesate de catre client in consola
        console.log("cale:", req.url);

        
        res.render("pagini" + req.url, function (err, rezRandare) {
            
            console.log("Eroare:", err);
            console.log("Rezultat randare:", rezRandare);
            if (err) {
                
                if (err.message.startsWith("Failed to lookup view "))
                    afiseazaEroare(res, 404); 
                else
                    afiseazaEroare(res); 
            } else {
                res.send(rezRandare); 
            }
        });
    } catch (err) {
       
        if (err.message.startsWith("Cannot find module")) {
            afiseazaEroare(res, 404); 
            console.log("Nu a gasit resursa: ", req.url)
        }
    }
});

// Functie pentru initializarea erorilor din fisierul JSON
function initializeazaErori() {
    
    var continut = fs.readFileSync(__dirname + "/Resurse/json/eroare.json").toString("utf-8");
    console.log(continut);

    var obErori = JSON.parse(continut);

    
    for (let eroare of obErori.info_erori) {
        eroare.imagine = "/" + obErori.cale_baza + "/" + eroare.imagine;
    }

    obGlobal.obErori = obErori;
}

// Apelul functiei de initializare a erorilor
initializeazaErori();

// Functie pentru afisarea unei erori in functie de identificatorul specificat
function afiseazaEroare(res, identificator, titlu = "titlu default", text, imagine) {

    let eroare = obGlobal.obErori.info_erori.find(
        function (elemErr) { 
            return elemErr.identificator == identificator 
        }
    );

    if (eroare) {

        let titlu1 = titlu == "titlu default" ? (eroare.titlu || titlu) : titlu;
        let text1 = text || eroare.text;
        let imagine1 = imagine || eroare.imagine;

        if (eroare.status)
            res.status(eroare.identificator).render("pagini/eroare", { titlu: titlu1, text: text1, imagine: imagine1 });
        else
            res.render("pagini/eroare", { titlu: titlu1, text: text1, imagine: imagine1 });
    } else {
        res.render("pagini/eroare", {
            titlu: obGlobal.obErori.eroare_default.titlu,
            text: obGlobal.obErori.eroare_default.text,
            imagine: obGlobal.obErori.eroare_default.imagine
        });
    }
}

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"Resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);

    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");

    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    for (let imag of vImagini){

        [numeFis, ext]=imag.fisier.split(".");

        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");

        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs); 

        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )

        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )
    }
    //console.log(obGlobal.obImagini)
}

initImagini();

// Functie pentru compilarea unui fisier SCSS intr-un fisier CSS.
function compileazaScss(caleScss, caleCss) {
    console.log("cale:", caleCss); // Afisam calea catre fisierul CSS in consola.
    
    // Daca nu este furnizata o cale pentru fisierul CSS.
    if (!caleCss) {
        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0]; 
        caleCss = numeFis + ".css"; 
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    

    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);
    

    let caleBackup = path.join(obGlobal.folderBackup, "Resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true }); // Cream directorul recursiv daca nu exista.
    }
    
   
    let numeFisCss = path.basename(caleCss); //basename e numele fisierului
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "Resurse/css", numeFisCss));
    }
    

    let rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css);
}

// Obtinem o lista de fisiere din directorul de fisiere SCSS.
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {

    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis);
    }
}


// Urmara modificarile in folderul specificat folosind fs.watch
fs.watch(obGlobal.folderScss, function(eveniment, numeFisier){
    console.log(eveniment, numeFisier); 
    if (eveniment == "change" || eveniment == "rename") { 
        let caleCompleta = path.join(obGlobal.folderScss, numeFisier); 
        if (fs.existsSync(caleCompleta)) { 
            compileazaScss(caleCompleta); 
        }
    }
})

// Pornirea serverului pe portul 8080
app.listen(8080);
console.log("Serverul a pornit");
