const testId = parseInt(sessionStorage.getItem("testId"))
const patientId = parseInt(sessionStorage.getItem("patientId"));
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const badgeS = document.getElementById("badge");
badgeS.innerHTML = parseInt(sessionStorage.getItem("numCompletedTests"))

window.onload = function(){
    context.canvas.width  = window.innerWidth*0.99;
   context.canvas.height = window.innerHeight*0.90;
    
    $.ajax({
        url: "/api/patients/"+patientId+"/tests/"+testId+"/replay",
        method: "get",
        success: function(result, status){
            if(result){
                var serRec = result.rec;
                var rec = deserializeDrawing(JSON.parse(serRec));
                console.log(rec);
                startDraw("canvas");
                drawing.recordings = rec;
                //set drawing property of each recording
                for (var i = 0; i < rec.length; i++){
                    rec[i].drawing = drawing;
                }
            }  
        }
    });
}