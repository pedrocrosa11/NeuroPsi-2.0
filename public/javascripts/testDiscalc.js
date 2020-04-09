const patientId = parseInt(sessionStorage.getItem("patientId"));

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
    var pergunta = {first: getRandomInt(min, max), signal:"+", second: getRandomInt(min, max)}
    pergunta.correctAnswer = pergunta.first+pergunta.second
    return pergunta 
}

//Devolve pergunta de Subtracao
function diffQuestion(min, max){
    var pergunta = {first: getRandomInt(min, max), signal:"-", second: getRandomInt(min, max)}
    pergunta.correctAnswer = pergunta.first-pergunta.second
    return pergunta 
}

//Devolve pergunta de Multiplicacao
function multQuestion(min, max){
    var pergunta = {first: getRandomInt(min, max), signal:"x", second: getRandomInt(min, max)}
    pergunta.correctAnswer = pergunta.first*pergunta.second
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
        //fazer um ajax para enviar a lista para o servidor, depois do servidor guardo na base de dados
        alert("Teste Submetido")
        window.location = "patientTestsDiscalc.html" //por isto dentro do ajax depois da confirmacao de ser enviado no futuro
        return
    }  
    document.getElementById("questionNumber").innerHTML = "Pergunta: "+ questionNumber +"/15"
    document.getElementById("firstNumber").innerHTML = String(lista[questionIndex].first)
    document.getElementById("signal").innerHTML = (lista[questionIndex].signal)
    document.getElementById("secondNumber").innerHTML = String(lista[questionIndex].second)
    document.getElementById("result").value = ""
    var questionNumber = questionIndex + 1
    document.getElementById("questionNumber").innerHTML = "Pergunta: "+ questionNumber + "/15"
}


window.onload = function(){
    //inactivityTime();
    guardarPerguntas(0, 15)
    document.getElementById("firstNumber").innerHTML = String(lista[0].first)
    document.getElementById("signal").innerHTML = (lista[0].signal)
    document.getElementById("secondNumber").innerHTML = String(lista[0].second)
}