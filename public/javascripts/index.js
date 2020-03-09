
$("#loginBtn").click(function(){
    var name = $("#name").val();
    $.ajax({
        url: "/api/users/" + name,
        method: "get",
        contentType: "application/json",
        dataType: "json",
        success: function(result, status){
            if(!result.user){
                alert("Esse utilizador não existe");
            }else{
                if(result.user.patientId != null){
                    sessionStorage.setItem("patientId", result.user.patientId);
                    sessionStorage.setItem("patientCoords", JSON.stringify(result.user.coords))
                    window.location = "patientTests.html";
                }else if(result.user.neuroId != null){
                    sessionStorage.setItem("neuroId",result.user.neuroId);
                    sessionStorage.setItem("neuroCoords", JSON.stringify(result.user.coords))
                    window.location = "patientsList.html";
                }
            }
        }
    })
})
