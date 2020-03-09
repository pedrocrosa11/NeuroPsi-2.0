const patientId = parseInt(sessionStorage.getItem('patientId'));
const testsT = document.getElementById("testsT");
const badgeS = document.getElementById("badge");
var patient;
var tests;

window.onload = function(){
    $.ajax({
        url: '/api/patients/'+patientId,
        method: 'get',
        success: function(result){
            patient = result.patient;
            patientInfoHtmlInjection(patient);
        }
    })
    $.ajax({
        url: '/api/patients/'+patientId+'/tests',
        method: 'get',
        success: function(result){
            tests = result.tests;
            notifyHtmlInjection(tests);
            testsHtmlInjection(tests);
        }
    })
}

function patientInfoHtmlInjection(patient){
    var str = "<p>ID: "+patient.patientId+"</p><p>Nome: "+patient.name+"</p><p>Idade: "+patient.age+"</p><p>Sexo: "+patient.sex+"</p>";
    patientInfoS.innerHTML = str;
}

function testsHtmlInjection(tests){
    var str="";
    for(t of tests){
        str += "<tr id="+t.testId+"><td>"+t.testId+"</td><td>"+t.testState+"</td><td>";
        if(t.testState == "Pending"){
            str+="<img id='binDelete' title='Cancelar teste' onclick=cancelTest("+t.testId+") onmouseover='disableOnclick("+t.testId+")' onmouseout='enableOnclick("+t.testId+",\""+t.testState+"\","+t.attribId+")' src='images/binDelete.png'>";
        }
        str += "</td><td>"+t.assignedDate+"</td><td>"+t.neuro+"</td><td>"+t.completedDate+"</td><td>"+t.comment+"</td></tr>";
    }
    testsT.innerHTML = str;
    for(t of tests){
        enableOnclick(t.testId, t.testState, t.attribId);
    }
}

function disableOnclick(testId){
    var elements = document.getElementById(testId);
    elements.onclick = null;
}

function enableOnclick(testId, testState, attribId){
    var elements = document.getElementById(testId);
    elements.onclick = openTest(testId, String(testState), attribId);
}

function cancelTest(testId){
    if(confirm("Quer mesmo cancelar este teste?")){
        var comment = prompt("Por favor indique a razão de ter cancelado este teste");
        $.ajax({
            url: '/api/patients/'+patientId+'/tests/'+testId+'/cancel',
            method:"post",
            data: {comment: "Cancelado pelo paciente: "+comment},
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

function openTest(testId, testState, attribId) {
    return function(){
        sessionStorage.setItem("testId", testId)
        sessionStorage.setItem("attribId", attribId)
        if(testState == "Pending"){
            window.location = 'testPatient.html';
        }else if(testState == "Completed"){
            window.location = 'resultsPatient.html'
        } 
    };
}

function notifyHtmlInjection(tests){
    var count = 0;
    for(t of tests){
        if(t.testState == "Pending"){
            count += 1;
        }
    }
    badgeS.innerHTML = count;
    sessionStorage.setItem("numPendingTests", count);
}