const attribId = parseInt(sessionStorage.getItem("attribId"));
const testId = parseInt(sessionStorage.getItem("testId"));
const patientId = parseInt(sessionStorage.getItem("patientId"));

var discalc
var discalcIndex = -1

window.onload = function(){
    //inactivityTime();
    $.ajax({
        url: "/api/patients/"+patientId+"/tests/"+testId,
        method: "get",
        success: function(result, status){
            discalc = result.discalc
            loadNextQuestion()
        }
    });
}

function loadNextQuestion(){
    if(discalcIndex != -1){
        saveResult()
    }
    discalcIndex++
    if(discalc.length == discalcIndex){
        guardarDiscalcResults(testId)
        return
    }
    var question = discalc[discalcIndex]
    var elem = document.getElementById("section")
    var str = 
            "<div id='firstNumber'>"+question.firstNumber+"</div>"
            +"<div id='sign'>"+question.sign+"</div>"
            +"<div id='secondNumber'>"+question.secondNumber+"</div>"
            +"<div id='equal'>=</div>"
            +"<input type='text' id='result'>"
    elem.innerHTML = str
    elem  = document.getElementById('questionNumber')
    var i = discalcIndex+1
    elem.innerHTML = "Pergunta: "+i+"/15"
}


function saveResult(){
    console.log(document.getElementById("result").value)
    console.log(document.getElementById("result"))
    var result = document.getElementById("result").value
    discalc[discalcIndex].result = result
}

function guardarDiscalcResults(testId){
    $.ajax({
        url: "/api/patients/"+patientId+"/tests/"+testId+"/discalculia/results",
        method: "post",
        data: {discalc:JSON.stringify(discalc)},
        success: function(res, status){
            alert("Teste submetido");
            window.location = "patientTests.html";
        }
    });
}
