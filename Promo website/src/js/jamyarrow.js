// Detect user agent
var isMobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	isMobile = true;
}

$( document ).ready(function() {
	// Overall controller
	var scrollMagicController = new ScrollMagic.Controller();

	// Hero path
	var heroPathScene = new ScrollMagic.Scene({
		triggerElement: "#hero-jar",
		offset: -300
	})
	.setTween(TweenMax.from("#jam-path-hero", 3.5, {
		height: 0
	}))
	.addTo(scrollMagicController);

	// Overview path pre
	var overviewPathPreScene = new ScrollMagic.Scene({
		triggerElement: "#overview-icon-diamond",
		offset: -200
	})
	.setTween(new TimelineMax().add([
		TweenMax.from("#jam-path-overview-pre", 2, {
			height: 0
		}),
		TweenMax.from("#overview-icon-diamond", 2, {
			marginTop: 60
		})
	]))
	.addTo(scrollMagicController);

	// Overview path post
	var overviewPathProScene = new ScrollMagic.Scene({
		triggerElement: "#jam-path-overview-post",
		offset: -200
	})
	.setTween(new TimelineMax().add([
		TweenMax.from("#jam-path-overview-post", 2, {
			height: 0
		})
	]))
	.addTo(scrollMagicController);

	// Process path
	var processPathScene = new ScrollMagic.Scene({
		triggerElement: "#jam-path-process",
		offset: -200
	})
	.setTween(new TimelineMax().add([
		TweenMax.from("#jam-path-process", 3, {
			height: 0
		}),
		TweenMax.from("#process-title", 3, {
			marginTop: 100
		})
	]))
	.addTo(scrollMagicController);

	// Jar animations
	// This part is mobile / desktop dependent
	if (!isMobile) {
		// Research process pre
		var researchProcessPathPreScene = new ScrollMagic.Scene({
			triggerElement: "#jam-path-research-pre",
			offset: -200
		})
		.setTween(new TimelineMax().add([
			TweenMax.from("#jam-path-research-pre", 1.5, {
				height: 0
			}),
			TweenMax.from("#jar-seed-container", 1.5, {
				marginTop: 60
			})
		]))
		.addTo(scrollMagicController);

		var jarSeedScene = new ScrollMagic.Scene({
			triggerElement: "#jar-seed-jar",
			offset: 0
		})
		.setTween(new TimelineMax().add([
			TweenMax.from("#jar-seed-jar", 1.5, {
				stroke:	"#EEEFEF"
			}),
			TweenMax.from("#jar-seed-earth", 1.5, {
				fill:	"#EEEFEF"
			}),
			TweenMax.from("#jar-seed-circle", 1.5, {
				stroke:	"#EEEFEF"
			}),
			TweenMax.from("#jar-seed-seed", 1.5, {
				alpha:	0
			}),
			TweenMax.from("#jar-seed-sprout", 1.5, {
				alpha:	0
			})
		]))
		.addTo(scrollMagicController);

		var researchProcessPathMid1Scene = new ScrollMagic.Scene({
			triggerElement: "#jam-path-research-mid-1",
			offset: 0
		})
		.setTween(new TimelineMax().add([
			TweenMax.from("#jam-path-research-mid-1", 2.5, {
				height: 0
			}),
			TweenMax.from("#jar-tree-container", 2.5, {
				marginTop: 150
			})
		]))
		.addTo(scrollMagicController);

		var jarTreeScene = new ScrollMagic.Scene({
			triggerElement: "#jar-tree-jar",
			offset: 0
		})
		.setTween(new TimelineMax().add([
			TweenMax.from("#jar-tree-jar", 1.5, {
				stroke:	"#EEEFEF"
			}),
			TweenMax.from("#jar-tree-earth", 1.5, {
				fill:	"#EEEFEF"
			}),
			TweenMax.from("#jar-tree-circle", 1.5, {
				stroke:	"#EEEFEF"
			}),
			TweenMax.from("#jar-tree-tree", 1.5, {
				alpha:	0
			})
		]))
		.addTo(scrollMagicController);

		var researchProcessPathMid2Scene = new ScrollMagic.Scene({
			triggerElement: "#jam-path-research-mid-2",
			offset: 0
		})
		.setTween(new TimelineMax().add([
			TweenMax.from("#jam-path-research-mid-2", 2, {
				height: 0
			}),
			TweenMax.from("#jar-blossom-container", 2, {
				marginTop: 150
			})
		]))
		.addTo(scrollMagicController);

		var jarBlossomScene = new ScrollMagic.Scene({
			triggerElement: "#jar-blossom-jar",
			offset: 0
		})
		.setTween(new TimelineMax().add([
			TweenMax.from("#jar-blossom-jar", 1.5, {
				stroke:	"#EEEFEF"
			}),
			TweenMax.from("#jar-blossom-earth", 1.5, {
				fill:	"#EEEFEF"
			}),
			TweenMax.from("#jar-blossom-circle", 1.5, {
				stroke:	"#EEEFEF"
			}),
			TweenMax.from("#jar-blossom-blossom", 1.5, {
				alpha:	0
			})
		]))
		.addTo(scrollMagicController);

		var researchProcessPathPostScene = new ScrollMagic.Scene({
			triggerElement: "#jam-path-research-post",
			offset: 0
		})
		.setTween(new TimelineMax().add([
			TweenMax.from("#jam-path-research-post", 2, {
				height: 0
			})
		]))
		.addTo(scrollMagicController);

	}

});






