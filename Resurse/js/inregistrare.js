window.onload= function(){
    var formular=document.getElementById("form_inreg");
    if(formular){
    formular.onsubmit= function(){
            if(document.getElementById("parl").value!=document.getElementById("rparl").value){
                alert("Nu ati introdus acelasi sir pentru campurile \"parola\" si \"reintroducere parola\".");
                return false;
            }

            return true;
        }
    }
 }

//  window.onload = function() {
//     var formular = document.getElementById("form_inreg");
//     if (formular) {
//         formular.onsubmit = function() {
//             var valid = true;

//             // Check required fields
//             var requiredFields = document.querySelectorAll("[required]");
//             requiredFields.forEach(function(field) {
//                 if (!field.value.trim()) {
//                     valid = false;
//                     alert("Field " + field.name + " is required.");
//                 }
//             });

//             // Check passwords match
//             if (document.getElementById("parl").value != document.getElementById("rparl").value) {
//                 valid = false;
//                 alert("The passwords do not match.");
//             }

//             // Check phone number format
//             var phone = document.getElementById("inp-telefon").value;
//             if (phone && !phone.match(/^\+?\d{10,}$/)) {
//                 valid = false;
//                 alert("The phone number must start with a '+' (optional) followed by at least 10 digits.");
//             }

//             // Additional validation: Username should not contain spaces
//             var username = document.getElementById("inp-username").value;
//             if (username && username.includes(" ")) {
//                 valid = false;
//                 alert("The username should not contain spaces.");
//             }

//             // Additional validation: Check if email contains 'example'
//             var email = document.getElementById("inp-email").value;
//             if (email && email.includes("example")) {
//                 valid = false;
//                 alert("The email should not contain 'example'.");
//             }

//             return valid;
//         }
//     }
// }

