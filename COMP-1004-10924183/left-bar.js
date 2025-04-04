// DOM elements
document.addEventListener('DOMContentLoaded', () => {
    const passwordList_2 = document.querySelector('.password-list');
    const addpassword_2 = document.querySelector('.add-password-form');
    const settings_page = document.querySelector('.settings');
    const home = document.getElementById('home');
    const save = document.getElementById('submit-new');
    //navigates back to the main screen 
    if (home){
        home.addEventListener('click', () => {
            if (passwordList_2 != null) {
                //adjusts the UI to match requirements 
                passwordList_2.style.display = 'block'; // Show the list
                settings_page.style.display = 'none';
                addpassword_2.style.display = 'none';
            } 
        })
    }
    // display the setting functionality hiding previous page elements 
    if (settings){ 
        settings.addEventListener('click', () => {
            if (settings != null) {
                //adjusts the UI to match requirements 
                const displayArea = document.querySelector('.rightDisplay');
                displayArea.style.display = 'Flex';
                // clears the right tab of elements 
                displayArea.innerHTML = ``;
                passwordList_2.style.display = 'none'; // Show the list
                addpassword_2.style.display = 'none';
                settings_page.style.display = 'flex';
            } 
        })
    }
});