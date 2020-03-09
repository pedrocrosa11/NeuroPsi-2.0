const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const testId = parseInt(sessionStorage.getItem("testId"));
const patientId = parseInt(sessionStorage.getItem("patientId"));
const numPendingTest = parseInt(sessionStorage.getItem("numPendingTests"))
const badgeS = document.getElementById("badge");
badgeS.innerHTML = numPendingTest;
var coords;

window.onload = function(){
   navigator.geolocation.getCurrentPosition(success, error);
   context.canvas.width  = window.innerWidth*0.99;
   context.canvas.height = window.innerHeight*0.90;

   $("#startBtn").click(function(){
        btnTxt = $(this).html();
        if(btnTxt == "Começar"){
            startRey();
            $(this).html("Proximo");
            
        }else if(btnTxt == "Proximo"){
            stopRecording();
            var serRec = serializeDrawing(drawing);
            context.clearRect(0,0, canvas.width, canvas.height);
            $.ajax({
                url: "/api/patients/"+patientId+"/tests/"+testId+"/replay",
                method: "post",
                data: {lat: coords.lat, lng: coords.lng, rec: JSON.stringify(serRec)},
                success: function(res, status){
                    alert("Teste submetido");
                    window.location = "patientTests.html";
                }
            });
        }
        $("#startBtn").prop("value","Proximo");
    });
}

function success(position){
    coords = {lat: position.coords.latitude, lng: position.coords.longitude};
}

function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
    patientLocation = JSON.parse(sessionStorage.getItem("patientCoords"));
    coords = {lat: patientLocation.y, lng: patientLocation.x}
};

function imgAnimation(img){
    var imgWidth = img.width;
    var imgHeight = img.height;
    var x = canvas.width/2 - imgWidth/2;
    var y = canvas.height/2 - imgHeight/2;
    
    var interval = setInterval(function(){    
        context.clearRect(0,0, canvas.width, canvas.height);
        context.drawImage(img, x, y, imgWidth, imgHeight);

        window.setTimeout(function(){
            if(imgWidth > canvas.width*0.35){
                x = canvas.width/2 - imgWidth/2;
                y = canvas.height/2 - imgHeight/2;
                imgWidth -= 2;
                imgHeight -= 2;
            }else{
                if(x < canvas.width - imgWidth || y > 0){
                    if(x < canvas.width - imgWidth){
                        x+=2;
                    }
                    if(y > 0){
                        y-=2;
                    }
                }else{
                    clearInterval(interval);
                }
            }
        }, 500);  
    }, 4);
}

function startRey(){
    var img = new Image();
    img.src = "images/reyImage.gif";
    img.onload = function(){
        imgAnimation(img);
    }
    window.setTimeout(function(){
        startDraw("canvas");
        startRecording();
    }, 1000);
}
