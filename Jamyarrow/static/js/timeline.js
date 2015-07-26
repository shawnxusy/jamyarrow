$(document).ready(function() {
    var isMobile = false;
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    	isMobile = true;
    }
    var screen_width = $(window).width();

    // Animate the timeline animation
    // Get the height of the description div first
    $(".timeline-content-item-detail").each(function(i, obj) {
        var div_height = $(obj).height();
        var line_before = $(obj).prev().find(".timeline-content-item-connector-before");
        var line_after = $(obj).prev().find(".timeline-content-item-connector-after");
        $(line_after).animate({
            height: div_height - 17
        }, 1500, function() {
        });
    });

    // The time widget for mobile
    if (isMobile) {
        setTimeout(function(){
            var detail_div_height = [];
            $(".timeline-content-item-detail").each(function(i, obj) {
                detail_div_height.push($(obj).offset().top);
            });
            detail_div_height[0] = 0;
            var date_widget_top = $("#floating-date").position().top;

            var cur = 1;
            $(window).on("scroll", function() {
                var to_top = $(this).scrollTop();
                $("#floating-date-hour").css("transform", "rotate(" + to_top + "deg)");
                $("#floating-date-minute").css("transform", "rotate(" + to_top * 2 +"deg)");

                if (to_top < 100) {
                    $("#floating-date").css("opacity", 0);
                }
                else{
                    $("#floating-date").css("opacity", 1);
                    if ((to_top + date_widget_top) > detail_div_height[cur]) {
                        cur++;
                        $($(".floating-date-date")[0]).text(($($(".timeline-content-item-detail")[cur-1]).parent().find(".timeline-content-item-date p").text()));
                    }
                    else if ((to_top + date_widget_top) < detail_div_height[cur-1]) {
                        cur--;
                        $($(".floating-date-date")[0]).text(($($(".timeline-content-item-detail")[cur-1]).parent().find(".timeline-content-item-date p").text()));
                    }
                }

                clearTimeout($.data(this, 'scrollTimer'));
                $.data(this, 'scrollTimer', setTimeout(function() {
                   // do something
                   $("#floating-date").animate({
                       opacity: 0
                   }, 300);
               }, 300));
                }
            );

        }, 2000);
    }

    // The add new entry button
    $("#timeline-content-add-icon, #timeline-content-add-word").on("click", function() {
        $(this).hide();
        $("#timeline-content-delete-icon").show();
        $("#timeline-content-add-form-wrapper").show();
        if (isMobile) {
            $("#floating-date").hide();
            $("#timeline-content-delete-icon").parent().hide();
        }
    });

    $("#timeline-content-delete-icon, #timeline-add-form-cancel").on("click", function() {
        $(this).hide();
        $("#timeline-content-add-icon").show();
        $("#timeline-content-add-form-wrapper").hide();
        if (isMobile) {
            $("#floating-date").show();
            $("#timeline-content-delete-icon").parent().show();
        }
    });

    $("#datetimepicker").datetimepicker();
    $(".edit-datetimepicker").datetimepicker();

    // Submit the entry
    // Trigger on confirm
    $("#timeline-add-form-submit").on("click", function(e) {
        e.preventDefault();
    	var data = new FormData($("#timeline-content-add-form").get(0));

        // Do error checking
        if ($("#timeline-add-form-title").val() === "") {
            $("#timeline-add-form-title-error").text("You need to name the event");
        }
        else {
        	// Ajax to update menu
        	$.ajax({
        		type: "POST",
        		url: window.location.pathname + "add_event",
        		data: data,
        		context: this,
        		cache: false,
        		processData: false,
        		contentType: false,
        		success: function(json) {
                    $("#timeline-content-add-form").find("input[type=text], input[type=file], textarea").val("");
                    $("#timeline-add-form-title-error").text("");
                    location.reload();
                    console.log("successfully posted");
        		},
        		error: function(xhr, error){
        			console.log(xhr.responseText);
        		}
        	});
            $("#timeline-content-add-form-wrapper").hide();
            $("#timeline-content-add-icon").show();
            $("#timeline-content-delete-icon").hide();
        }
    });

    // Trigger on edit
    $(".timeline-edit-form-submit").on("click", function(e) {
        e.preventDefault();
        var form = $(this).parent();
    	var data = new FormData($(form).get(0));

    	// Ajax to update menu
    	$.ajax({
    		type: "POST",
    		url: window.location.pathname + "edit_event",
    		data: data,
    		context: this,
    		cache: false,
    		processData: false,
    		contentType: false,
    		success: function(json) {
                location.reload();
                console.log("successfully posted");
    		},
    		error: function(xhr, error){
    			console.log(xhr.responseText);
    		}
    	});
    });

    // Trigger on delete
    $(".timeline-edit-form-delete").on("click", function(e) {
        e.preventDefault();
        if (confirm("Do you want to delete this event?")) {
            var form = $(this).parent();
            var data = new FormData($(form).get(0));

            // Ajax to update menu
            $.ajax({
                type: "POST",
                url: window.location.pathname + "delete_event",
                data: data,
                context: this,
                cache: false,
                processData: false,
                contentType: false,
                success: function(json) {
                    location.reload();
                    console.log("successfully posted");
                },
                error: function(xhr, error){
                    console.log(xhr.responseText);
                }
            });
        }
    });

    // Display attachment
    $(".timeline-content-item-attachment").each(function(i, obj) {
        if ( $.trim($(obj).html()).length ) {
            // Have something to display
            var path =  (window.location.href.indexOf("match") >= 0) ? "../../../static/libs/document-viewer/" : "../static/libs/document-viewer/";
            var viewer = new DocumentViewer({
                $anchor: $(obj),
                width: isMobile? screen_width - 18 : screen_width * 0.42,
                path: path,
            });
            // console.log(window.location.hostname + "/media/" + $.trim($(obj).html()));
            viewer.load( "/media/" + $.trim($(obj).html()));

            if (isMobile) {
                var pos_left = $(this).parent().position().left + 3;
                $(this).find(".document-viewer-wrapper").css("margin-left", "-" + pos_left + "px");
                $(this).parent().css("border-bottom", "none");
            }
            // Lengthen the connector
            setTimeout(function() {
                var line_after = $(obj).parent().parent().find(".timeline-content-item-connector-after");
                // console.log($(line_after).height());
                var div_height = $(obj).parent().height();

                $(line_after).animate({
                    height: div_height - 17
                }, 3000, function() {

                });

            }, 1000);
        }
    });

    $(".timeline-content-item-detail-edit").on("click", function() {
        var detail_div = $(this).parent().parent().parent();
        $(detail_div).next().show();
        $(detail_div).hide();
        if (isMobile) {
            $(detail_div).prev().hide();
        }
    });

    $(".timeline-content-filter-list").on("click", "button", function(e) {
        $(this).parent().find("button.active").toggleClass("active");
        $(this).parent().find(".timeline-content-filter-search input").val("");
        var class_name_highlight = $(this).attr("class").split("-").slice(2).join("-");

        $(".timeline-content-item").each(function(i, obj) {
            $(obj).show();
            if (class_name_highlight != "all") {
                if ($(obj).attr("class").indexOf(class_name_highlight) == -1) {
                    $(obj).hide();
                }
            }
        });

        $(this).toggleClass("active");

    });

    $(".timeline-content-filter-search input").on("input", function() {
        $(this).parent().parent().find("button.active").toggleClass("active");
        var search_term = $(this).val();
        $(".timeline-content-item").each(function(i, obj) {
            $(obj).show();
            if (obj.outerHTML.indexOf(search_term) == -1) {
                $(obj).hide();
            }
        });
    });

});
