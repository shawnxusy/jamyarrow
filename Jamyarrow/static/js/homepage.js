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
		$.ajax({
			type: "POST",
			url: window.location.pathname + "add_track_entry/" + $(form).find(".tracked-item-id").val(),
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
			},
			error: function(xhr) {
				console.log("error occurred");
				console.log(xhr.statusText);
				console.log(xhr.responseText);
			}
		});

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
});

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
