const patientId = parseInt(sessionStorage.getItem("patientId"));
const testId = parseInt(sessionStorage.getItem("testId"));

var lista = []
var questionIndex = 0

//Gera numeros random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

//Devolve pergunta de Soma
function sumQuestion(min, max){
    var pergunta = {firstNumber: getRandomInt(min, max), sign:"+", secondNumber: getRandomInt(min, max)}
    pergunta.correctAnswer = pergunta.firstNumber+pergunta.secondNumber
    return pergunta 
}

//Devolve pergunta de Subtracao
function diffQuestion(min, max){
    var pergunta = {firstNumber: getRandomInt(min, max), sign:"-", secondNumber: getRandomInt(min, max)}
    pergunta.correctAnswer = pergunta.firstNumber-pergunta.secondNumber
    return pergunta 
}

//Devolve pergunta de Multiplicacao
function multQuestion(min, max){
    var pergunta = {firstNumber: getRandomInt(min, max), sign:"x", secondNumber: getRandomInt(min, max)}
    pergunta.correctAnswer = pergunta.firstNumber*pergunta.secondNumber
    return pergunta 
}

//Carrega as perguntas todas na lista (window on load)
function guardarPerguntas(min, max){
    for (i = 0; i < 5; i++){
        lista.push(sumQuestion(min, max))
    }

    for (i = 0; i < 5; i++){
        lista.push(diffQuestion(min, max))
    }

    for (i = 0; i < 5; i++){
        lista.push(multQuestion(min, max))
    }
} 

//load da proxima pergunta
function loadNextQuestion(){
    var answer = document.getElementById("result").value
    lista[questionIndex].answer = parseInt(answer)
    questionIndex++

    if (questionIndex > 13){
        document.getElementById("startBtn").innerHTML = "Submeter"
    }
    if (questionIndex > 14){
        guardarTeste(testId, lista)
        alert("Teste Submetido")
        window.location = "patientTestsDiscalc.html"
        return
    }  
    document.getElementById("questionNumber").innerHTML = "Pergunta: "+ questionNumber +"/15"
    document.getElementById("firstNumber").innerHTML = String(lista[questionIndex].firstNumber)
    document.getElementById("sign").innerHTML = (lista[questionIndex].sign)
    document.getElementById("secondNumber").innerHTML = String(lista[questionIndex].secondNumber)
    document.getElementById("result").value = ""
    var questionNumber = questionIndex + 1
    document.getElementById("questionNumber").innerHTML = "Pergunta: "+ questionNumber + "/15"
}


window.onload = function(){
    //inactivityTime();
    guardarPerguntas(0, 10)
    document.getElementById("firstNumber").innerHTML = String(lista[0].firstNumber)
    document.getElementById("sign").innerHTML = (lista[0].sign)
    document.getElementById("secondNumber").innerHTML = String(lista[0].secondNumber)
}

function guardarTeste(patientId, testName){
    $.ajax({
        url: "/api/patients/"+patientId+"/tests/"+testId+"/discalculia/results",
        method: "post",
        data: {tests:JSON.stringify(lista)},
        success: function(res, status){
            alert("Teste submetido");
            window.location = "patientTestsDiscalc.html";
        }
    });
}