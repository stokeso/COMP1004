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

// DOM elements 
document.addEventListener('DOMContentLoaded', async () => {
    const add_pass = document.getElementById('add-btn-menu');
    const passwordList = document.querySelector('.password-list');
    const addpassword = document.querySelector('.add-password-form');
    const addback = document.getElementById('add-back');
    const submit = document.getElementById('submit');
    const settings_page = document.querySelector('.settings');

    const rightBarForm = document.querySelector('.rightBarForm');
    const rightDisplay = document.querySelector('.rightDisplay');
    
    const website = document.getElementById('website').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const masterDelete = document.getElementById('master-delete');
    const updateWebsite = document.getElementById('updateWebsite');
    const updateUsername = document.getElementById('updateUsername');
    const updatePassword = document.getElementById('updatePassword')
    const passwordinput = document.getElementById("password");
    const toggleBtn = document.getElementById("togglebutton");
    const deleteBtn = document.getElementById("deleteBtn");
    const editBtn = document.getElementById("EditBtn");
    const editBack = document.getElementById("editBack");
    const save = document.getElementById("save");
    //add password event listener that adaps the UI accordingly upon interaction
    if (add_pass){
        add_pass.addEventListener('click', (event) => {
            event.preventDefault();
            if (passwordList != null) {
                passwordList.style.display = 'none'; 
                addpassword.style.display = 'flex';
                settings_page.style.display = 'none';
            } 
        })

    }
    //delete password event listener that facilitates the deletion of password at user discretion
    if (deleteBtn){
        deleteBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (selected != null) {
                deleteBlobs(selected);
            } 
        })

    }
    // delete all data stored in local storage 
    if (masterDelete){
        masterDelete.addEventListener('click', (event) => {
            event.preventDefault();
            alert("This action is irreversible and will remove all data that is stored locally. You will be sent back to the login menu to continue your usage.")
            let websites = JSON.parse(localStorage.getItem('website_storage')) || [];
            if (websites != null) {
                websites = []; // this clears the array
                localStorage.setItem('website_storage', JSON.stringify(websites));
                updatePasswordList();
            } 
        })

    }
    // facilitates the editing of stored data in a accesible format
    if (editBtn){
        editBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            if (editBtn != null) {
                //makes key and decrypts password of current site 
                const pageKey = await makeKey('passphrase');
                let decryptedPassword = await decryptInput(selected.pass,pageKey);
                // gathers non encrypted credentials 
                let currentWebsite = selected.website;
                let currentPassword = decryptedPassword;
                let currentUsername = selected.username;
                let currentEmail = selected.email;
                // adjusts the ui to suit current requirements of edits
                const displayArea = document.querySelector('.rightBarForm')
                rightBarForm.style.display = 'flex';
                rightDisplay.style.display = 'none';
                // asigns the values of credentials to be used later
                updateWebsite.value = currentWebsite;
                updateUsername.value = currentUsername;
                updateEmail.value = currentEmail;
                updatePassword.value = currentPassword;

            } 
        })
    }
    // saves changes that are made within the editing of current credentials 
    if (save){
        save.addEventListener('click', async (event) => {
            event.preventDefault();
            if (selected != null) {
                //gathers the values that are in the edit input fields wether they have changed or not 
                const updateWebsite = document.getElementById('updateWebsite').value;
                const updateUsername = document.getElementById('updateUsername').value;
                const updateEmail = document.getElementById('updateEmail').value;
                const updatePassword = document.getElementById('updatePassword').value;
                //updates the stored credentials with the modified ones
                editBlobs(updatePassword);
                //adjusts the ui and clears data fields      
                rightBarForm.style.display = 'none';
                rightDisplay.style.display = 'Flex';
                updateWebsite.value = null;
                updateUsername.value = null;
                updateEmail.value = null;
                updatePassword.value = null;
                let currentWebsite = null;
                let currentPassword = null;
                let currentEmail = null;
                let currentUsername = null;
                let decryptedPassword = null; 
                
            } 
        })
    }
    // allows the user to return from editing without confirming alterations 
    if (editBack){
        editBack.addEventListener('click', (event) => {
            event.preventDefault();
            if (selected != null) { 
                //adjusts the ui so that the defualt page is showing and the editing ui is hidden      
                updateWebsite.value = null;
                updateUsername.value = null;
                updateEmail.value = null;
                updatePassword.value = null;
                let currentWebsite = null;
                let currentPassword = null;
                let currentEmail = null;
                let currentUsername = null;  
                rightBarForm.style.display = 'none';
                rightDisplay.style.display = 'Flex';
                displayWebsite(selected);
            } 
        })
    }
    //allows the user to return to the default ui without compleatingf the add password form
    if(addback){
        addback.addEventListener('click', (event) => {
            event.preventDefault();
            if (passwordList != null) {
                // adjusts the ui to accomodate the requirements 
                passwordList.style.display = 'block'; // Show the list
                addpassword.style.display = 'none';
                settings_page.style.display = 'none';
            }
        })
    }
    //confirms the user input to adda a website to local storage 
    if(submit){
        submit.addEventListener('click', async (event) => {
            event.preventDefault();
            if (passwordList != null) {
                //returns the UI to the default ui that displays the new website
                passwordList.style.display = 'block'; // Show the list
                addpassword.style.display = 'none';
                settings_page.style.display = 'none';
                //gathers user inputs for storage 
                const website = document.getElementById('website').value;
                const username = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const pageKey = await makeKey('passphrase');
                const strength = passwordStrength(document.getElementById('password').value); // measures the strength of the password before encryption
                //encrypts the user inputted password 
                const pass = await encryptInput(document.getElementById('password').value, pageKey);
                let websites = JSON.parse(localStorage.getItem('website_storage')) || [];
                //clarifies if the inputted website already is stored in the password manager 
                if (websites.some(site=>site.website===website)){
                    alert("already present")
                    return
                }
                // puts all credentials into an array 
                const newCreds = { website, username, email, pass, strength: strength.strength };
                
                websites.push(newCreds);
                localStorage.setItem('website_storage', JSON.stringify(websites));


                // clears all in[put fields 
                document.getElementById('website').value = '';
                document.getElementById('username').value = '';
                document.getElementById('email').value = ''; 
                document.getElementById('password').value = '';
                passwordinput.type = "password";
                updatePasswordList();
            }
        })
    }
    // allows the user to preview the inputted password only while hovered over the respective symbol
    if(togglebutton) {
        togglebutton.addEventListener("mouseover", function (event) {
            event.preventDefault();
            if (togglebutton != null){
                passwordinput.type = passwordinput.type === "password" ? "text" : "password";
            }
        })
        togglebutton.addEventListener("mouseout", function (event) {
            event.preventDefault();
            if (togglebutton != null){
                passwordinput.type = passwordinput.type === "password" ? "text" : "password";
            }
        })
    }
    // checks the strength of a passed in password 
    function passwordStrength(testPassword) {
        let passwordrank = 0;
        //measures the quantity of recommended features and adjusts the security rank accordingly
        if (testPassword.length >= 8) passwordrank++;
        if (/[A-Z]/.test(testPassword)) passwordrank++;
        if (/[a-z]/.test(testPassword)) passwordrank++;
        if (/\d/.test(testPassword)) passwordrank++;
        if (/[\W_]/.test(testPassword)) passwordrank++;
        //returns the respective strength based off of the calculated value 
        if (testPassword.length === 0) {
            return{strength: ''};
        }else if (passwordrank <= 2) {
            return{strength: 'Weak Password'};
        }else if (passwordrank === 3 || passwordrank === 4) {
            return{strength: 'Medium Password'};
        }else {
            return{strength: 'Strong Password'};
        }
    }
    // adds another button to the password list to then display the new website or modified value 
    function updatePasswordList() {
        const passwordlist = document.getElementById("passlist");
        passwordList.innerHTML = '';
        let websites = JSON.parse(localStorage.getItem('website_storage')) || [];

        websites.forEach(site => {
            // creates a new button for the respective website and ajusts the ui to facilitate its location  
            let button = document.createElement("button");
            button.textContent = `${site.website}`;
            button.addEventListener('click', () => {
                rightBarForm.style.display = 'none';
                rightDisplay.style.display = 'Flex';

                selected = site;
                displayWebsite(site);
                
            })
            passwordList.appendChild(button);
        })
    }
    // when a website is clicked the contents is outputed in its respective ui 
    async function displayWebsite(site){
        const pageKey = await makeKey('passphrase');
        // decrypts the selected password
        let decryptedPassword = await decryptInput(site.pass,pageKey);
        const displayArea = document.querySelector('.rightDisplay');
        displayArea.style.display = 'Flex';
        // adjusts html to output the credentials 
        displayArea.innerHTML = 
        `<ul>
            <li>website: ${site.website}</li>
            <li>username: ${site.username}</li>
            <li>email: ${site.email}</li>
            <li>password: ${decryptedPassword}</li>
            <li>password strength: ${site.strength}</li>          
        </ul>`;
    }
    // deleets selected data elemets when ran 
    function deleteBlobs(site){
        let websites = JSON.parse(localStorage.getItem('website_storage')) || [];
       // creates a new instance of the storage without the selected item 
        websites = websites.filter(entry => entry.website !== site.website);
        // stores new instance 
        localStorage.setItem('website_storage', JSON.stringify(websites));
        const displayArea = document.querySelector('.rightDisplay');
        displayArea.style.display = 'Flex';
        displayArea.innerHTML = ``;
        // updates the password list 
        updatePasswordList();
    }

    async function editBlobs(newpassword){
        const pageKey = await makeKey('passphrase');
        let websites = JSON.parse(localStorage.getItem('website_storage')) || [];
        // finds the selected websites index in storage 
        let websiteIndex = websites.findIndex(entry => entry.website === selected.website);
        // measures new password strength before encryption
        const newstrength = passwordStrength(newpassword);
        const updatePassword = await encryptInput(newpassword,pageKey);
        if (websiteIndex !== -1){
            // updates array with new values 
            websites[websiteIndex] = {website: updateWebsite.value, username: updateUsername.value, email: updateEmail.value, pass: updatePassword, strength: newstrength.strength}
            //stores new array as a json object 
            localStorage.setItem('website_storage', JSON.stringify(websites));
            // adjusts UI to return to default page 
            const displayArea = document.querySelector('.rightDisplay');
            displayArea.innerHTML = ``;
            updatePasswordList();
        }
    }

    updatePasswordList();
});
   
   