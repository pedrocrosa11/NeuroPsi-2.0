const patientId = parseInt(sessionStorage.getItem('patientId'));


window.onload = function(){
    inactivityTime();
    $.ajax({
        url: '/api/patients/'+patientId,
        method: 'get',
        success: function(result){
            patient = result.patient;
            patientInfoHtmlInjection(patient);
        }
    })

    //ajax for discalc tests
}

function patientInfoHtmlInjection(patient){
    var str = "<p>ID: "+patient.patientId+"</p><p>Nome: "+patient.name+"</p><p>Idade: "+patient.age+"</p><p>Sexo: "+patient.sex+"</p>";
    patientInfoS.innerHTML = str;
}


function showTestsRey(){
    window.location = "patientTests.html"
}

//temporary function to see discalc test
function temporaryFunction(){
    window.location = "testDiscalc.html"
}
