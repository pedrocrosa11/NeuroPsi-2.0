const resultsTable = document.getElementById("testsT");
const discalcId = parseInt(sessionStorage.getItem('testId'));

$.ajax({
    url: "/api/users/tests/discalculia/"+ discalcId,
    method: "get",
    success: function(result, status){
         var discalc = result.discalc
         console.log(discalc)
         loadResultsToTable(discalc)
    }
});

function loadResultsToTable(discalc){
    var str="";
    var number = 1;
    for(d of discalc){
        str += "<tr><td>"+number+"</td><td>"+d.firstNumber+"</td><td>"+d.sign+"</td><td>"+d.secondNumber+"</td><td>"+d.result+"</td><td>"+d.correctAnswer+"</td></tr>";
        number++;
    }
    resultsTable.innerHTML = str;
}