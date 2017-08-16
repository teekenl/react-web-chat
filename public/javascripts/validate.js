function validateInput(event){
    var target = event;

    var validateInputFunction = {
        '1': checkUser(),
        '2': checkPassword()
    };

    for(var i = 0 ; i< validateInputFunction.length; i++) {
        if(!validateInputFunction[i]) {

            return false;
        }
    }
    return true;
}

function checkUser(){
    var username = document.getElementById('username');
    return username.length === 0;
}

function checkPassword() {
    var userpassword = document.getElementById('userpassword');
    return userpassword.length === 0;
}
