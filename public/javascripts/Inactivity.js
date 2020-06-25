var inactivityTime = function () {
    var time;
    window.onload = resetTimer;
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer;  // catches touchscreen presses as well      
    window.ontouchstart = resetTimer; // catches touchscreen swipes as well 
    window.onclick = resetTimer;      // catches touchpad clicks as well
    window.onkeypress = resetTimer;   
    window.addEventListener('scroll', resetTimer, true); // improved; see comments

    function logout() {
        location.href = 'index.html'
        alert("You are now logged out.")
    }

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(logout, 10000)
        // 1000 milliseconds = 1 second
        // Currently is 300 sec (5min)
    }
};

/*window.onload = Function() 
    inactivityTime();

    <script src="javascripts/Inactivity.js"></script> */
