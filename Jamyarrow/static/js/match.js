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
        save_settings(e, true);

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
        save_settings(e, false);
        e.preventDefault();
        var previewURL = $(this).attr("href");
        setTimeout(function(){
            window.location.href = previewURL;
        }, 200);
    });

    function save_settings(e, commit) {
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
        data.append("commit_change", commit);

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

    function changeSearchInput() {
        var input = $("#match-search-input");
        // Calculate the total width
        var totalWidth = $(input).parent().width();
        var totalTokenWidth = 0;
        if ($(".match-search-token-wrapper").length !== 0) {
            var noOfLine = Math.floor($($(".match-search-wrapper")[0]).height() / $($(".match-search-token-wrapper")[0]).outerHeight());

            $(input).parent().find(".match-search-token-wrapper").each(function() {
                if ($(this).position().top > ($($(".match-search-token-wrapper")[0]).outerHeight() * (noOfLine - 1))) {
                    totalTokenWidth += $(this).outerWidth();
                }
            });
            var remainingWidth = totalWidth - totalTokenWidth;
            console.log(remainingWidth);

            if (remainingWidth < 80) {
                $(input).css("width", "100%");
            }
            else {
                $(input).css("width", (remainingWidth - 60) + "px");
            }
        }
        else {
            $(input).css("width", "100%");
        }
    }

    $("#match-search-input").bind("keyup", function(e) {
        var key = e.keyCode || e.which;
        var len = $(this).val().length;

        if (key == 32) { // space
            if ($(this).val() === " ") {
                $(this).val("");
            }
            else {
                var entry = $(this).val().substring(0, len-1);
                var wrapper = $("<div class='match-search-token-wrapper'><p>" + entry + "<span class='glyphicon glyphicon-remove'></span></p></div>");
                if ($(this).prev().length !== 0) {
                    $(wrapper).insertAfter($(this).prev());
                }
                else {
                    $(this).parent().prepend($(wrapper));
                }
                // Temporary change input width to 0
                $("#match-search-input").css("width", "0");
                var input_real = cleanedString($("#match-search-input-real").val() + " " + entry);
                $("#match-search-input-real").val(input_real);
                $(this).val("");
                changeSearchInput();
            }
        }
        if (((key == 46) || (key == 8)) && ($(this).val() === "")) {
            if ($(this).prev().attr("id") == "age-wrapper") {
                $("#match-search-age").remove();
            }
            if ($(this).prev().attr("id") == "type-stage-wrapper") {
                $("#match-search-type").remove();
                $("#match-search-stage").remove();
            }
            var last = $(this).prev().find("p").text();
            var after_deletion = cleanedString($("#match-search-input-real").val().replace(last, ""));
            $("#match-search-input-real").val(after_deletion);
            $(this).prev().remove();

            // Temporary change input width to 0
            $("#match-search-input").css("width", "0");
            
            changeSearchInput();
        }
    });

    $(".match-search").on("click", ".glyphicon-remove", function(){
        $(this).parent().parent().remove();
        // Expand the search to fit remaining area
        changeSearchInput();
    });

});

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function cleanedString(str) {
    var newStr = "";
    var splitted = str.split(" ");
    for (var i = 0; i < splitted.length; i++) {
        if (splitted[i] !== "") {
            newStr = newStr.concat(splitted[i] + " ");
        }
    }
    newStr = newStr.substring(0, newStr.length - 1);
    return newStr;
}
