const patientId = parseInt(sessionStorage.getItem('patientId'));
const neuroId = parseInt(sessionStorage.getItem('neuroId'));
const attribId = parseInt(sessionStorage.getItem('attribId'));
const testsT = document.getElementById("testsT");
const patientInfoS = document.getElementById("patientInfoS");
const marcarRey = document.getElementById("marcarRey");
const marcarDiscalc = document.getElementById("marcarDiscalc");
const badgeS = document.getElementById("badge");

var patient;
var tests;

window.onload = function(){
    inactivityTime();
    $.ajax({
        url: '/api/patients/'+patientId,
        method: 'get',
        success: function(result, status){
            patient = result.patient;
            patientInfoHtmlInjection(patient);
        }
    })
    getNeuroPatientTests(attribId) 
}

function patientInfoHtmlInjection(patient){
    var str = "<p>ID: "+patient.patientId+"</p><p>Nome: "+patient.name+"</p><p>Idade: "+patient.age+"</p><p>Sexo: "+patient.sex+"</p>";
    patientInfoS.innerHTML = str;
}

function testsHtmlInjection(tests){
    var str="";
    console.log(tests)
    for(t of tests){
        var testType
        if(t.discalcId){
            testType = "discalc"
        }else if(t.reyId){
            testType = "rey"
        }
        str += "<tr id="+t.testId+" onclick = 'openTest("+t.testId+","+t.testState+","+testType+")'><td>"+t.testId+"</td><td>"+t.testState+"</td><td>";
        if(t.testState == "Pending"){
            str+="<img id='binDelete' title='Cancelar teste' onclick=cancelTest("+t.testId+") onmouseover='disableOnclick("+t.testId+")' onmouseout='enableOnclick("+t.testId+","+t.testState+","+testType+")' src='images/binDelete.png'>";
        }else if(t.testState == "Completed"){
            console.log(t.testState)
            str+="<img title='Arquivar teste' onclick=fileTest("+t.testId+") onmouseover='disableOnclick("+t.testId+")' onmouseout='enableOnclick("+t.testId+","+t.testState+","+testType+")' src='images/file.png'><img title='Remarcar teste' onclick='rescheduleTest("+t.testId+","+testType+")' onmouseover='disableOnclick("+t.testId+")' onmouseout='enableOnclick("+t.testId+","+t.testState+","+testType+")' src='images/reschedule.png'>";
        }
        str += "</td><td>"+t.assignedDate+"</td><td>"+t.completedDate+"</td><td>"+t.comment+"</td></tr>"; 
    }
    testsT.innerHTML = str;
    for(t of tests){
        var testType
        if(t.discalcId){
            testType = "discalc"
        }else if(t.reyId){
            testType = "rey"
        }
        enableOnclick(t.testId, t.testState, testType);
    }
}

function disableOnclick(testId){
    var elements = document.getElementById(testId);
    elements.onclick = null;
}

function enableOnclick(testId, testState, testType){
    console.log(testState)
    var elements = document.getElementById(testId);
    elements.onclick = openTest(testId, testState, testType);
}

function cancelTest(testId){
    if(confirm("Quer mesmo cancelar este teste?")){
        var comment = prompt("Por favor indique a razão de ter cancelado este teste");
        $.ajax({
            url: '/api/patients/'+patientId+'/tests/'+testId+'/cancel',
            method:"post",
            data: {comment: "Cancelado pelo psicólogo: "+comment},
            success: function(){
                alert("Teste cancelado com sucesso");
                location.reload(); 
            },
            error: function(){
                console.log("Error");
            }
        })
    }
}

function fileTest(testId){
    if(confirm("Quer arquivar o teste "+testId+"?")){
        var comment = prompt("Adicione aqui o comentário");
        $.ajax({
            url: '/api/patients/'+patientId+'/tests/'+testId+'/file',
            method:"post",
            data: {comment: comment},
            success: function(){
                alert("Teste arquivado com sucesso");
                location.reload(); 
            },
            error: function(){
                console.log("Error");
            }
        })
    }
}

function openTest(testId, testState, testType) {
    return function(){
        sessionStorage.setItem("testId", testId)
        sessionStorage.setItem("attribId", attribId)
        if(testState == "Completed" || testState == "Filed"){
            if(testType == "discalc"){
                window.location = 'resultsPatientDiscalc.html'
            }else if(testType = "rey"){
                window.location = 'resultsNeuro.html'
            }
        } 
    };
}

function scheduleTest(){
    $.ajax({
        url:"/api/neuros/"+neuroId+"/patients/"+patientId+"/tests",
        method:"post",
        data: {attribId: attribId},
        success: function(data, status){
            alert("Teste marcado");
        },
        error: function(){
            console.log("Error");
        }
    })
}

//NEW
function scheduleTestDiscalc(){
    $.ajax({
        url:"/api/neuros/"+neuroId+"/patients/"+patientId+"/tests/discalculia",
        method:"post",
        data: {attribId: attribId},
        success: function(data, status){
            alert("Teste marcado");
        },
        error: function(){
            console.log("Error");
        }
    })
}

function rescheduleTest(testId, testType){
    console.log("Entrou")
    if(confirm("Quer remarcar o teste "+testId+"?")){
        var comment = prompt("Adicione aqui a razão da remarcação");
        $.ajax({
            url:"/api/neuros/"+neuroId+"/patients/"+patientId+"/tests/"+testId+"/reschedule",
            method:"post",
            data: {attribId: attribId, comment: "Remarcado porque: "+comment, testType: testType},
            success: function(data, status){
                alert("Teste remarcado com sucesso");
                location.reload();
            },
            error: function(){
                console.log("Error");
            }
        })
    }
}

function getNeuroPatientTests(attribId){
    $.ajax({
        url: '/api/neuros/'+neuroId+'/attributions/'+attribId+'/tests',
        mathod: 'get',
        success: function(result, status){
            tests = result.tests;
            console.log(tests)
            testsHtmlInjection(tests);
        }
    })
}

function notifyHtmlInjection(num){
    badgeS.innerHTML = num;
}

function updateNotify(testState){
    $.ajax({
        url:"/api/neuros/"+neuroId+"/patients/tests/state/"+testState,
        method:"get",
        success: function(result, status){
            var teste = result.tests;
            notifyHtmlInjection(teste.length)
        },
        error: function(){
            console.log("Error");
        }
    })
}