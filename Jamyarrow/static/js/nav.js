var isMobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	isMobile = true;
}

// The left bar expansion
$(document).ready(function() {
    if (isMobile) {
        $("#side-toggle").on("click", function() {
			$(".navig").addClass("slide");
            $(".nav-hamburger").hide();
            // $(".logo-grid").removeAttr("href");
        });

        $(".logo-container, .nav-fold").on("click", function() {
            $(".navig").removeClass("slide");
			setTimeout(function() {
				$(".nav-hamburger").show();
			}, 300);
        });
    }
});
