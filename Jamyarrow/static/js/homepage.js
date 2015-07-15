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
