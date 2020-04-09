
$("#loginBtn").click(function(){
    var name = $("#name").val();
    var password = $("#pass").val();
    $.ajax({
        url: "/api/users/?name=" + name + "&pass=" + password,
        method: "get",
        contentType: "application/json",
        dataType: "json",
        success: function(result, status){
            if(!result.user){
                alert("Username ou Password incorreta");
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
 


