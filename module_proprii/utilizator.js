const AccesBD = require('./accesbd.js');
const parole = require('./parole.js');
const { RolFactory } = require('./roluri.js');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

class Utilizator {
    static tipConexiune = "local";
    static tabel = "utilizatori";
    static parolaCriptare = "web";
    static emailServer = "nixxie.drugstore@gmail.com";
    static lungimeCod = 64;
    static numeDomeniu = "localhost:8080";
    static numeSite = "Nixxie Drugstore";
    #eroare;

    constructor({ id, username, nume, prenume, email, parola, rol, culoare_chat = "black", poza, data_nasterii, telefon } = {}) {
        this.id = id;

        //optional sa facem asta in constructor
        try {
            if (this.checkUsername(username))
                this.username = username;
            else throw new Error("Username incorect");
        }
        catch (e) { this.#eroare = e.message }

        for (let prop in arguments[0]) {
            this[prop] = arguments[0][prop]
        }
        if (this.rol)
            this.rol = this.rol.cod ? RolFactory.creeazaRol(this.rol.cod) : RolFactory.creeazaRol(this.rol);
        console.log(this.rol);

        this.#eroare = "";
    }

    checkName(nume) {
        return nume != "" && nume.match(new RegExp("^[A-Z][a-z]+$"));
    }

    set setareNume(nume) {
        if (this.checkName(nume)) this.nume = nume
        else {
            throw new Error("Nume gresit")
        }
    }

    set setareUsername(username) {
        if (this.checkUsername(username)) this.username = username
        else {
            throw new Error("Username gresit")
        }
    }

    checkUsername(username) {
        return username != "" && username.match(new RegExp("^[A-Za-z0-9#_./]+$"));
    }

    static criptareParola(parola) {
        return crypto.scryptSync(parola, Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex");
    }

    salvareUtilizator() {
        let parolaCriptata = Utilizator.criptareParola(this.parola);
        let utiliz = this;
        let token1 = parole.genereazaToken(50, "abcdefghijklmnopqrstuvwxyz");
        let token2 = Math.floor(Date.now() / 1000);  // timestamp in seconds
        let cod = `${token1}-${token2}`;  // codul complet
    
        AccesBD.getInstanta(Utilizator.tipConexiune).insert({
            tabel: Utilizator.tabel,
            campuri: {
                username: this.username,
                nume: this.nume,
                prenume: this.prenume,
                parola: parolaCriptata,
                email: this.email,
                culoare_chat: this.culoare_chat,
                cod: cod,  // stocare cod complet
                poza: this.poza,
                data_nasterii: this.data_nasterii,
                telefon: this.telefon,
                confirmat: false
            }
        }, function (err, rez) {
            if (err) {
                console.log(err);
            } else {
                utiliz.trimiteMail(
                    `Salut, stimate ${utiliz.nume}`,
                    `Username-ul tău este ${utiliz.username} pe site-ul ${Utilizator.numeDomeniu}.`,
                    `<h1>Salut!</h1>
                    <p style='color:black'>Username-ul tău este ${utiliz.username} pe site-ul ${Utilizator.numeSite}.</p>
                    <p><a href='http://${Utilizator.numeDomeniu}/cod/${token1}-${token2}/${utiliz.username.toUpperCase()}'>Click aici pentru confirmare</a></p><br>
                    <p><b><i><u>Cu drag echipa ${Utilizator.numeSite}</u></i></b></p>`
                );
            }
        });
    }
    
    // salvareUtilizator() {
    //     if (!this.username || !this.nume || !this.prenume || !this.parola || !this.email || !this.data_nasterii) {
    //         throw new Error("All required fields must be filled.");
    //     }

    //     let utiliz = this;
    //     let token = parole.genereazaToken(100);

    //     // Check if username already exists
    //     Utilizator.getUtilizDupaUsername(this.username, {}, function(u, obparam, eroare) {
    //         if (eroare == -2) {
    //             throw new Error("Database error.");
    //         } else if (eroare == -1) {
    //             let parolaCriptata = Utilizator.criptareParola(utiliz.parola);
    //             AccesBD.getInstanta(Utilizator.tipConexiune).insert({
    //                 tabel: Utilizator.tabel,
    //                 campuri: {
    //                     username: utiliz.username,
    //                     nume: utiliz.nume,
    //                     prenume: utiliz.prenume,
    //                     parola: parolaCriptata,
    //                     email: utiliz.email,
    //                     culoare_chat: utiliz.culoare_chat,
    //                     cod: token,
    //                     poza: utiliz.poza,
    //                     data_nasterii: utiliz.data_nasterii,
    //                     telefon: utiliz.telefon
    //                 }
    //             }, function(err, rez) {
    //                 if (err) {
    //                     console.log(err);
    //                 } else {
    //                     utiliz.trimiteMail("Te-ai inregistrat cu succes", "Username-ul tau este " + utiliz.username,
    //                         `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`,
    //                     );
    //                 }
    //             });
    //         } else {
    //             throw new Error("Username already exists.");
    //         }
    //     });
    // }

    async trimiteMail(subiect, mesajText, mesajHtml, atasamente = []) {
        var transp = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth: {
                user: Utilizator.emailServer,
                pass: "tfrgjumfjsaebixa"
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        await transp.sendMail({
            from: Utilizator.emailServer,
            to: this.email,
            subject: subiect,
            text: mesajText,
            html: mesajHtml,
            attachments: atasamente
        })
        console.log("trimis mail");
    }

    static async getUtilizDupaUsernameAsync(username) {
        if (!username) return null;
        try {
            let rezSelect = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync(
                {
                    tabel: "utilizatori",
                    campuri: ['*'],
                    conditiiAnd: [`username='${username}'`]
                });
            if (rezSelect.rowCount != 0) {
                return new Utilizator(rezSelect.rows[0])
            }
            else {
                console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul");
                return null;
            }
        }
        catch (e) {
            console.log(e);
            return null;
        }

    }

    static getUtilizDupaUsername(username, obparam, proceseazaUtiliz) {
        if (!username) return null;
        let eroare = null;
        AccesBD.getInstanta(Utilizator.tipConexiune).select(
            {
                tabel: "utilizatori",
                campuri: ['*'],
                conditiiAnd: [`username='${username}'`]
            },
            function (err, rezSelect) {
                if (err) {
                    console.error("Utilizator:", err);
                    eroare = -2;
                }
                else if (rezSelect.rowCount == 0) {
                    eroare = -1;
                }
                let u = new Utilizator(rezSelect.rows[0])
                proceseazaUtiliz(u, obparam, eroare);
            });
    }

    areDreptul(drept) {
        return this.rol.areDreptul(drept);
    }
}

module.exports = { Utilizator: Utilizator }
