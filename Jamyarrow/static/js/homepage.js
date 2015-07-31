$(document).ready(function() {
    // $(".quicktrack-tabs").on("click", "li", function(e){
    //     e.preventDefault();
    //   $(".quicktrack-tabs li.active").removeClass("active");
    //   $(this).addClass("active");
    // });
    $('#quicktrack-tabs').tab();

    // Add quick track
    $("#quicktrack-submit-0, #quicktrack-submit-1, #quicktrack-submit-2").on("click", function(e) {
        e.preventDefault();
        var form = $(this).parent();
        var formName = $(form).parent().attr("id").split("-")[1];
        var originalID = $(form).find(".tracked-item-id").val();
        if ((($(form).find(".input-quality").length !== 0) && ($(form).find(".input-quality:checked").length === 0)) || (($(form).find(".input-severity").length !== 0) && ($(form).find(".input-severity:checked").length === 0))) {
            console.log("subm");
            $(form).append($("<span class='quicktrack-submit-error'>You need to select a scale</span>"));
            $(".quicktrack-submit-error").animate({
                opacity: 0,
            }, 3000, function(){
                $(this).remove();
            });
        }
        else {
    		$.ajax({
    			type: "POST",
    			url: window.location.pathname + "add_track_entry/" + originalID,
    			data: {
                    severity: $(form).find(".input-severity:checked").val() || 0,
                    duration: $(form).find(".input-duration").val() || 0,
                    quality: $(form).find(".input-quality:checked").val() || 0,
                    quantity: $(form).find(".input-quantity").val() || 0,
                    yes_no: $(form).find(".input-yes-no").val() || 0,
                    note: $(form).find(".input-note").val() || "",
                    csrfmiddlewaretoken: $(form).find(".tracked-item-id").next().val()
    			},
    			success: function(data) {
                    console.log(data);
                    $(form).find(".tracked-item-id").attr("value", parseInt(originalID) + 1);
                    $(form).hide();
                    var confirmDiv = $("<div class='quicktrack-confirmation center'><div class='quicktrack-confirmation-tick'><span class='glyphicon glyphicon-ok vertical-center'></span></div><p class='quicktrack-confirmation-text'>You've logged your " + formName + "!</p><p id='quicktrack-confirmation-link'>Log another entry</p></div>");
                    $(form).parent().append($(confirmDiv));
    			},
    			error: function(xhr) {
    				console.log("error occurred");
    				console.log(xhr.statusText);
    				console.log(xhr.responseText);
    			}
    		});
        }
    });

    $(".quicktrack-tabs-content").on("click", "#quicktrack-confirmation-link", function() {
        var form = $(this).parent().prev();
        $(form).show();
        $(this).parent().remove();
        $(form).find("textarea").val("");
        $(form).find("input:checked").prop("checked", false);
    });

    $(".hero-greeting-quote").on("click", "#edit-quote", function() {
        var parent = $(this).parent().parent();
        var existing = $("#hero-greeting-quote-content").text();
        $("#hero-greeting-quote-content").hide();
        $("#hero-greeting-quote-author").hide();
        var inputContent = $("<input name='content' id='hero-greeting-quote-modify-content' class='smaller-1' placeholder='Your quote:'>");
        var inputAuthor = $("<input name='author' id='hero-greeting-quote-modify-author' class='smaller-2 semi-bold' placeholder='Author'>");
        var submit = $("<button type='submit' id='hero-greeting-quote-submit' class='glyphicon glyphicon-ok'>");
        $(parent).append(inputContent);
        $(parent).append(inputAuthor);
        $(parent).append(submit);
    });



    $(".hero-greeting-quote").on("click", "#hero-greeting-quote-submit", submitQuote);
    $(".hero-greeting-quote").on("change", "#hero-greeting-quote-modify-author", submitQuote);

    function submitQuote() {
        if ($("#hero-greeting-quote-modify-content").val() === "") {
            // Do nothing
            $("#hero-greeting-quote-modify-content").remove();
            $("#hero-greeting-quote-modify-author").remove();
            $("#hero-greeting-quote-submit").remove();
            $("#hero-greeting-quote-content").show();
            $("#hero-greeting-quote-author").show();
        }
        // Ajax to update menu
        else {
            var csrftoken = $.cookie('csrftoken');
            var content = $("#hero-greeting-quote-modify-content").val();
            var author =  $("#hero-greeting-quote-modify-author").val();
        	$.ajax({
                beforeSend: function(xhr, settings) {
    				if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
    					xhr.setRequestHeader("X-CSRFToken", csrftoken);
    				}
    			},
        		type: "POST",
        		url: window.location.pathname + "edit_quote",
        		data: {content: content,
                        author: author},
        		success: function(json) {
                    $("#hero-greeting-quote-modify-content").remove();
                    $("#hero-greeting-quote-modify-author").remove();
                    $("#hero-greeting-quote-submit").remove();
                    $("#hero-greeting-quote-content").text(content);
                    $("#hero-greeting-quote-content").append($("<span id='edit-quote' class='glyphicon glyphicon-pencil'></span>"));
                    $("#hero-greeting-quote-author").text(author);

                    $("#hero-greeting-quote-content").show();
                    $("#hero-greeting-quote-author").show();
        		},
        		error: function(xhr, error){
        			console.log(xhr.responseText);
        		}
        	});
        }
    }

    $(".quicktrack-form-duration-content input").on("change mousemove", function() {
        var new_duration = $(this).val();
        // convert duration to hour + 10 min
        var hour = Math.floor(new_duration / 60);
        var ten_min = Math.floor(new_duration % 60 / 10);
        var new_display;
        if (hour === 0) new_display = ten_min + "0 minutes";
        if (ten_min === 0) new_display = hour + " hours";
        if ((hour === 0) && (ten_min === 0)) new_display = Math.floor(new_duration % 60) + " minutes";
        if ((hour !== 0) && (ten_min !== 0)) {
            new_display = hour + " hours " + ten_min + "0 minutes";
        }
        $(this).parent().prev().text(new_display);
    });

    $(".tips-content-block").on("click", ".glyphicon-thumbs-up", function(e) {
        e.preventDefault();
        $(this).toggleClass("divider-grey").toggleClass("grass-green");
    });

    $(".tips-content-block").on("click", ".glyphicon-thumbs-down", function(e) {
        e.preventDefault();
        var originalQuote = $(this).parent().prev().text();
        var newQuote = tipsBase[Math.floor(Math.random() * tipsBase.length)];
        while (newQuote == originalQuote) {
            newQuote = tipsBase[Math.floor(Math.random() * tipsBase.length)];
        }
        if (!isMobile) {
            $(this).parent().parent().animate({
                bottom: -800,
            }, 300, function() {
                $(this).css("bottom", 0);
                $(this).find(".tips-content-content").text(newQuote);
            });
        } else {
            $(this).parent().parent().animate({
                left: -800,
            }, 300, function() {
                $(this).css("left", 0);
                $(this).find(".tips-content-content").text(newQuote);
            });
        }
    });
});

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

tipsBase = [
    "Having more water would help you recover from side effects of chemotherapy.",
    "An apple after lunch and dinner is magic to your recovery.",
    "Your symptoms may fluctuate from time to time, keeping good record of them will help you and your doctor.",
    "Great quality sleep is key to fighting cancer, try some nice music before sleep!",
    "It is very helpful to spend half an hour every day outside, even just sitting on a bench in a park.",
    "A call with an old friend is sometimes more effective than a hundred-dollar drug",
    "Exercising does not necessarily need to take place in a gym. Try something on bed, floor, or in a park.",
    "Take deep breaths when you feel dizzy or having a panic attack. Do not get too nervous, try to reach out to your caretaker",
    "Keeping a diary on events that happened is a great way to calm your mind and prepare for a high quality sleep",
    "While you may experience poor sleeps, you can always try to make with a good afternoon nap."
];
