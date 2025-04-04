// creates a async fuction that makes the encryption key
async function makeKey(phrase){
    //stores the passphrase
    let userPassPhrase = phrase;
    // derives a cryptograhpic key from the inputted passphrase using
    const baseKey = await window.crypto.subtle.importKey("raw",new TextEncoder().encode(userPassPhrase),{name: "PBKDF2"}, false,["deriveKey"]);
    // derives a strong encryption key from the basekey using PBKDF2
    const pageKey = await window.crypto.subtle.deriveKey({name: "PBKDF2", salt: new TextEncoder().encode(userPassPhrase), iterations: 1000000,hash: "SHA-256"}, baseKey,{name: "AES-CBC", length: 256 }, true, ["encrypt", "decrypt"]);
    return pageKey;// returns the encryption key back to the program 
}
async function encryptInput(plainText,pageKey) {
    //converts plainText to be an array format 
    const inputToEncrypt = new TextEncoder().encode(plainText);
    //gereates random iv
    const initializationVector = window.crypto.getRandomValues(new Uint8Array(16));

    try {
        //encrypt the the users input 
        const cipheredText = await window.crypto.subtle.encrypt(
            { name: 'AES-CBC', iv: initializationVector },pageKey,inputToEncrypt);
        //converst the encrypted text to an array
        const encryptedData = new Uint8Array(cipheredText);
        return{ 
            //returns encrypted password and its iv
            iv: Array.from(initializationVector),
            encryptedPassword: Array.from(encryptedData)};
    } catch (error) {
        // signifies if the encryption fails for any reason
        return "Encryption failed";
    }
}

async function decryptInput(encrypted, Key) {
    try {
        // ensures the encrypted password is in an array format
        const encryptedData = new Uint8Array(encrypted.encryptedPassword);
        // converts the respective iv to an array format
        const initializationVector1 = new Uint8Array(encrypted.iv);
        //decrypts the encrypted password 
        const decryptedBuffer = await window.crypto.subtle.decrypt({ name: 'AES-CBC', iv: initializationVector1 },Key,encryptedData);
        // converts array back to string and returns the value 
        return new TextDecoder().decode(decryptedBuffer);

    } catch (error) {
        console.error("Decryption error:", error);

        return "Decryption failed";
    }
}

// DOM  elements for the login page
document.addEventListener('DOMContentLoaded', async () => {
    const signuppage = document.querySelector('.signuppage');
    const logoutbutton = document.getElementById('logout')
    const loginpage = document.querySelector('.loginpage');
    const signupbutton = document.getElementById('signupbutton');
    const loginButton = document.getElementById('login');
    const masterDelete = document.getElementById('master-delete');
    const loginContainer = document.querySelector('.loginContainer');
    const mainContainer = document.querySelector('.mainContainer');
    const signuppagebutton = document.getElementById('signupPageButton');

    //checks if logout is clicked and adapts the UI elements accordingly
    if (logoutbutton){
        logoutbutton.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelector('.password-list').style.display = 'block'; // Show the list
            document.querySelector('.add-password-form').style.display = 'none';
            document.querySelector('.settings').style.display = 'none';
            loginContainer.style.display = 'flex';
            mainContainer.style.display = 'none';
        })
    }
    // checks if the user would like to make an account and displays accordingly
    if (signuppagebutton){
        signuppagebutton.addEventListener('click', (event) => {
            event.preventDefault();
            signuppage.style.display = 'flex';
            loginpage.style.display = 'none';
        })
    }
    // hhandles the sign up functionality
    if (signupbutton){
        signupbutton.addEventListener('click', (event) => {
            event.preventDefault();
            signuppage.style.display = 'flex';
            loginpage.style.display = 'none';
            if (signup()){
                signuppage.style.display = 'none';
                loginpage.style.display = 'flex';
            }
        })
    }
    // clears all stored credentials that could be found in local storage 
    if (masterDelete){
        masterDelete.addEventListener('click', (event) => {
            event.preventDefault();
            let logins = JSON.parse(localStorage.getItem('loginStoragetemp')) || [];
            if (logins != null) {
                logins = []; // This clears the array
                //resets the UI to be consistent upon every log in 
                localStorage.setItem('loginStoragetemp', JSON.stringify(logins));
                document.querySelector('.password-list').style.display = 'block'; // Show the list
                document.querySelector('.add-password-form').style.display = 'none';
                document.querySelector('.settings').style.display = 'none';
                loginContainer.style.display = 'flex';
                mainContainer.style.display = 'none';
            } 
        })

    }
    // handles the log in functionality of the page 
    if (loginButton){
        loginButton.addEventListener('click', async (event) => {
            event.preventDefault();
            // waits upon the the check for the credentials before acting
            if (await verifyCredentials() === true) {
                loginContainer.style.display = 'none';
                mainContainer.style.display = 'block';
            }else{
                loginContainer.style.display = 'flex';
                mainContainer.style.display = 'none';
            }
        })

        
    }
    // an async fuction that handles the user sign up 
    async function signup(){
        let store = localStorage.getItem('loginStoragetemp')
        // checks for an existing account 
        if (!store || store.trim() === '[]') {
            const pageKey = await makeKey('passphrases');
            const createuser = document.getElementById('createUser').value;
            const createpass = document.getElementById('createPass').value;
            const confirmcreatepass = document.getElementById('confirmCreatePass').value;
            // ensures that the two passwords entered by the users match 
            if (createpass === confirmcreatepass){
                //encrypts the password 
                const createpassStore = await encryptInput(createpass, pageKey);
                //stores thje encrypted password alsong side the username 
                let logins = JSON.parse(localStorage.getItem('loginStoragetemp')) || [];
                const loginCreds = {createuser, createpassStore}; 
                        
                logins.push(loginCreds);
                localStorage.setItem('loginStoragetemp', JSON.stringify(logins));
                // clears all input fields                 
                document.getElementById('loginUser').value = '';
                document.getElementById('loginPass').value = '';
                document.getElementById('createUser').value = '';
                document.getElementById('createPass').value = '';
                document.getElementById('confirmCreatePass').value = '';
                //signifies success
                alert("account created")
                return true;
            }else{
                //warns the user of a mistake 
                alert("Passwords do not match");
                return;
            }
        }else{
            // clears all input fields 
            document.getElementById('createUser').value = '';
            document.getElementById('createPass').value = '';
            document.getElementById('confirmCreatePass').value = '';
            //signifies that only one account can be active per system 
            alert("An account already exists. Delete it before creating a new one.");
            return;
        }

    }
    async function verifyCredentials(){
        // gathers the users input 
        const loginuser = document.getElementById('loginUser').value;
        const loginpass = document.getElementById('loginPass').value;
        const logins = JSON.parse(localStorage.getItem('loginStoragetemp')) || [];
        const pageKey = await makeKey('passphrases');
        // finds where the login credentials were stored on local storage 
        const userlogin = logins.find(login => login.createuser === loginuser);
        if (!userlogin) {
            //alerts the user of an issue without signifying were it is to ensure security
            alert("Username or password is invalid.");
            return false;
        }

        // waits to decrypt the password and stores it for comparison
        const currentloginpass = await decryptInput(userlogin.createpassStore, pageKey);
        if (!logins){
            document.getElementById('loginUser').value = '';
            document.getElementById('loginPass').value = '';
            alert("no account exists at this current time");
            return false;
        }
        // checks if inputted credentials match stored ones
        if (loginpass === currentloginpass && loginuser === userlogin.createuser){
            document.getElementById('loginUser').value = '';
            document.getElementById('loginPass').value = '';
            return true;
        }
        // clears input fields 
        document.getElementById('loginUser').value = '';
        document.getElementById('loginPass').value = '';
        alert("either the username or password is wrong")
        return false;
    }


});


