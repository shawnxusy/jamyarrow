$(document).ready(function() {
    var isMobile = false;
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    	isMobile = true;
    }

    $("#profile-visibility").on("change", function() {
        if (!$(this).prop("checked")) {
            $("#contact-visibility, #tracker-visibility, #doctor-visibility").prop("checked", false);
            $("#contact-visibility, #tracker-visibility, #doctor-visibility").prop("disabled", true);
        }
        if ($(this).prop("checked")) {
            $("#contact-visibility, #tracker-visibility, #doctor-visibility").prop("disabled", false);
        }
    });

    $("#timeline-visibility").on("change", function() {
        if (!$(this).prop("checked")) {
            $("#milestone-visibility, #test-result-visibility, #appointment-visibility, #prescription-visibility, #my-event-visibility").prop("checked", false);
            $("#milestone-visibility, #test-result-visibility, #appointment-visibility, #prescription-visibility, #my-event-visibility").prop("disabled", true);
        }
        if ($(this).prop("checked")) {
            $("#milestone-visibility, #test-result-visibility, #appointment-visibility, #prescription-visibility, #my-event-visibility").prop("disabled", false);
        }
    });

    $("#privacy-next-1").on("click", function() {
        $("#privacy-setting-1").animate({
            left: "-2000",
            opacity: 0
        }, 200);
        $("#privacy-setting-2").animate({
            left: "0",
            opacity: 1
        }, 200);
    });

    $("#privacy-previous-2").on("click", function() {
        $("#privacy-setting-2").animate({
            left: "2000",
            opacity: 0
        }, 200);
        $("#privacy-setting-1").animate({
            left: "0",
            opacity: 1
        }, 200);
    });

    $("#privacy-next-2").on("click", function(e) {
        // Post to save the events
        save_settings(e);

        $("#privacy-setting-2").animate({
            left: "-2000",
            opacity: 0
        }, 200);
        $("#privacy-setting-3").animate({
            left: "0",
            opacity: 1
        }, 200);
    });

    $("#privacy-timeline-preview").on("click", function(e) {
        save_settings(e);
        e.preventDefault();
        var previewURL = $(this).attr("href");
        setTimeout(function(){
            window.location.href = previewURL;
        }, 200);
    });

    function save_settings(e) {
        data = new FormData();
        data.append("profile_visible", $("#profile-visibility").prop("checked"));
        data.append("contact_visible", $("#contact-visibility").prop("checked"));
        data.append("category_visible", $("#tracker-visibility").prop("checked"));
        data.append("doctor_visible", $("#doctor-visibility").prop("checked"));
        data.append("timeline_visible", $("#timeline-visibility").prop("checked"));
        data.append("milestone_visible", $("#milestone-visibility").prop("checked"));
        data.append("test_result_visible", $("#test-result-visibility").prop("checked"));
        data.append("appointment_visible", $("#appointment-visibility").prop("checked"));
        data.append("prescription_visible", $("#prescription-visibility").prop("checked"));
        data.append("my_event_visible", $("#my-event-visibility").prop("checked"));

        var csrftoken = $.cookie('csrftoken');

    	// Ajax to update menu
    	$.ajax({
            beforeSend: function(xhr, settings) {
				if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
					xhr.setRequestHeader("X-CSRFToken", csrftoken);
				}
			},
    		type: "POST",
    		url: window.location.pathname + "save_settings",
    		data: data,
    		context: this,
    		cache: false,
    		processData: false,
    		contentType: false,
    		success: function(json) {
                console.log(json.success);
    		},
    		error: function(xhr, error){
    			console.log(xhr.responseText);
    		}
    	});
    }

    $("#privacy-previous-3").on("click", function() {
        $("#privacy-setting-2").animate({
            left: "0",
            opacity: 1
        }, 200);
        $("#privacy-setting-3").animate({
            left: "2000",
            opacity: 0
        }, 200);
    });

});

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
