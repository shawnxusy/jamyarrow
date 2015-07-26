"use strict";

var DocumentViewerDependencyLoader = function (loaderOptions) {
    var load, dependencies, dependencyTests;

    //paths to each dependency
    dependencies = {
        pdfjs:['libs/pdfjs/compatibility.js', 'libs/pdfjs/pdf.js'],
        prettify:['libs/google-code-prettify/prettify.js', 'libs/google-code-prettify/prettify.css'],
        flowplayer:['libs/flowplayer/flowplayer-3.2.6.min.js'],
        jplayer:['libs/jPlayer/jquery.jplayer.min.js']
    };

    yepnope.errorTimeout = loaderOptions.errorTimeout || 4000;

    //tests to determine if the dependency is already loaded
    dependencyTests = {
        pdfjs:function () {
            return typeof PDFJS !== 'undefined';
        },
        prettify:function () {
            return typeof prettyPrint !== 'undefined';
        },
        flowplayer:function () {
            return typeof flowplayer !== 'undefined';
        },
        jplayer:function () {
            return typeof $.jPlayer !== 'undefined';
        }
    };

    //if the user has specified a different path for the libs folder, update the paths for each of the dependencies
    if (loaderOptions.path) {
        var realPaths = {};

        $.each(dependencies, function (key, dependency) {
            var files = [];

            $.each(dependency, function (i, file) {
                files.push(loaderOptions.path + file);
            });

            realPaths[key] = files;
        });

        dependencies = realPaths;
    }

    function loadDependency(userOptions) {
        var options = $.extend({}, loaderOptions, userOptions);

        load = [];

        //test for the dependency, if it exists run the callback. If not, load the dependency then run the callback
        //TODO: Look at the yepnope api. It probably handles this case.
        if (dependencyTests[options.dependency]()) {
            options.callback();
        }
        else {
            yepnope({
                load:dependencies[options.dependency],
                complete:function () {
                    //check to see if the dependency actually loaded, since script loaders can't accurately report
                    //loading errors in a cross browser manner (from yepnope docs)
                    if (dependencyTests[options.dependency]()) {
                        if ($.isFunction(options.callback)) {
                            options.callback();
                        }
                    }
                    else {
                        //there was an error loading the dependency. Throw an error
                        options.errorHandler('There was an error loading the dependency (' + dependencies[options.dependency] + ') Please check your options.path value');
                    }

                }
            });
        }
    }

    return{
        loadDependency:loadDependency
    };
};

var DocumentViewer = function (userOptions) {
    var
        codeExtensions = ['bsh', 'c', 'cc', 'cpp', 'cs', 'csh', 'css', 'cyc', 'cv', 'htm', 'html', 'java', 'js',
            'm', 'mxml', 'perl', 'php', 'pl', 'pm', 'py', 'rb', 'sh', 'xhtml', 'xml', 'xsl', 'sql', 'vb'],
        imageExtensions = ['png', 'jpg', 'jpeg', 'gif'],
        audioExtensions = ['mp3', 'm4a', 'oga', 'webma', 'fla'],
        jPlayerVideoExtensions = ['mp4', 'ogv', 'ogg', 'webmv', 'flv'],
        jPlayerExtensions = jPlayerVideoExtensions.concat(audioExtensions),
        defaultOptions = {
            width:500,
            height:'auto',
            debug:false,
            autoPlay:true,
            autoLoadDependencies:true,
            enableTextAndCode:false,
            jPlayer:{},
            timeoutValue:4000,
            path:'document-viewer/',
            isModal:false,
            setUnsupportedSizeAsSquare:true
        },
        options = {},
        dependencyLoader,
        id,
        //used when creating placeholders
        audioPlayerHeight,
        videoPlayerHeight,
        lang = {
            emptyText:'<div class="document-viewer-empty-text">No Document Loaded</div>',
            unsupportedBrowserText:'<div class="document-viewer-empty-text">This document can not be opened in this browser. Please upgrade.</div>',
            errorText:'An error occurred while loading the ',
            serverResponseText:'Unexpected server response of '
        },
        playerSizes = {};


    function init() {
        //apply any user defined options
        options = $.extend(true, {}, defaultOptions, userOptions);

        //nothing has been loaded yet, add the empty text;
        //$inner.html(options.emptyText);


        //initialize the dependency loader
        dependencyLoader = new DocumentViewerDependencyLoader({
            path:options.path,
            errorHandler:debugMessage
        });
    }

    function getType(ext) {
        var type = false;

        if (ext === 'pdf') {
            type = 'pdf';
        }
        else if (ext === 'txt') {
            type = 'txt';
        }
        else if ($.inArray(ext, codeExtensions) !== -1) {
            type = 'code';
        }
        else if ($.inArray(ext, jPlayerVideoExtensions) !== -1) {
            type = 'video';
        }
        else if ($.inArray(ext, audioExtensions) !== -1) {
            type = 'audio';
        }
        else if ($.inArray(ext, imageExtensions) !== -1) {
            type = 'image';
        }

        return type;
    }

    function uniqueId(){
        return new Date().getTime() + '-' + Math.floor(Math.random() * (100000 - 1 + 1)) + 1;
    }

    function debugMessage(msg) {
        if (options.debug && window.console) {
            console.log('DOCUMENT VIEWER: ' + msg);
        }
    }

    function getExtension(filename) {
        //From: Tomalak's answer, http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript
        var re = /(?:\.([^.]+))?$/;
        return re.exec(filename)[1];
    }

    //get the class or id for a selector
    function c(selector) {
        if (cssSelector[selector]) {
            return cssSelector[selector].substr(1);
        }
        else {
            return '';
        }
    }

    function loadDependency(dependency, callback) {
        //if the user doesn't want to use the dependency loader, run the callback immediately (this assumes the user
        //has included the dependency manually
        if (!options.autoLoadDependencies) {
            callback();
        }
        else {
            dependencyLoader.loadDependency({
                dependency:dependency,
                callback:callback
            });
        }
    }

    function setLanguage(langguage){
        lang = language;
    }

    function load(filename, userOptions) {
     var doc = initRender(filename, userOptions);

        doc.load();

        return doc;
    }

    function testPlayerSizes(anchorWidth){
        var invisibleDom,
            playerMarkup,
            wrapper, wrapperMargin,
            documentWidth,
            audioTestMarkup, audioTest,
            videoTestMarkup, videoTest;


        invisibleDom = new InvisibleDom(true);


        playerMarkup = getPlayerMarkup();

        audioTestMarkup = '<div class="document-viewer audio">' + playerMarkup + '</div>';
        audioTest = invisibleDom.element($(audioTestMarkup).width(anchorWidth));

        audioPlayerHeight = audioTest.getSize().height;


        videoTestMarkup = '<div class="document-viewer video">' + playerMarkup + '</div>';
        videoTest = invisibleDom.element($(videoTestMarkup).width(anchorWidth));

        videoPlayerHeight = videoTest.$element.find('.player-controls').outerHeight(true);

        invisibleDom.destroy();

        return{
            audioPlayerHeight:audioPlayerHeight,
            videoPlayerHeight:videoPlayerHeight
        }
    }

    function initRender(filename, userOptions){
        var loadOptions, doc;

        loadOptions = $.extend(true, {}, options, userOptions);

        doc = new DocumentInstance(filename, loadOptions);

        if(!playerSizes[doc.width]){
            playerSizes[doc.width] = testPlayerSizes(doc.width);
        }


        doc.renderPlaceHolder();
        return doc;
    }
    //Convenience method for:
    // 1. determining what type of document is associated with a given filename
    // 2. Determining if a document can be opened i.e. if(getDocumentType !== false)
    function getDocumentType(filename) {
        return getType(getExtension(filename));
    }

    function getName(path){
        return path.replace(/^.*[\\\/]/, '')
    }

    function getDetails(path){
        var details = {};

        details.name = getName(path);
        details.extension = getExtension(path);
        details.type = getType(details.extension);

        return details;
    }





    function getPlayerMarkup(){
        return DocumentInstance.prototype.getJPlayerMarkup();
    }

  var theThing;

    var DocumentInstance = function (filename, documentOptions) {
        this.filename = filename;

        this.type = null;
        this.extension = null;

        this.$anchor = null;
        this.$element = null;
        this.$inner = null;
        this.$loadingIndicator = null;

        this.loadEventId = null;

        this.$jPlayerAnchor = null;

        this.isLoaded = null;

        this.hasPlaceholder = false;
        this.$placeHolder = null;

        //sometimes we might want to leave the placeholder even if this document is technically a type we could display.
        //for example if this is a text or code docuemnt, but text and code isn't enabled.
        this.leavePlaceholder = false;

        $.extend(true, this, options, documentOptions);

        this.init();
    };

    DocumentInstance.prototype.initModal = function(){

       var self = this, $body, $closeButton;

        $body = $('body');
        $closeButton = $('<div class="document-viewer-close"></div>');

        this.$anchor = $('<div class="document-viewer-modal-overlay"></div>');

        $body.prepend(this.$anchor);
        $body.addClass('has-document-viewer-modal');

        this.$element.addClass('document-viewer-modal');

        this.$element.append($closeButton);


        $closeButton.on('click', function(){
            self.close();
            $body.removeClass('has-document-viewer-modal');
        });

        this.$element.on('click', function(e){
            e.stopPropagation();
        });
        this.$anchor.on('click', function(){
            //self.close();
        });

    };

    DocumentInstance.prototype.close = function(){
        this.$anchor.empty().remove();
    };

    DocumentInstance.prototype.init = function () {
        var cssSelector, markup, id;

        cssSelector = {
            scrollable:'.scrollable',
            viewport:'.viewport',
            scrollContent:'.scroll-content',
            wrapper:'.document-viewer-wrapper',
            outer:'.document-viewer-outer',
            anchor:'.document-viewer'
        };

        markup = '<div class="document-viewer-wrapper dv-markup clearfix">' +
            '<div class="document-viewer-outer dv-markup clearfix">' +
            '<div class="document-viewer dv-markup clearfix"></div>' +
            '</div>' +
            '</div>';


        this.$element = $(markup);
        theThing = this.$element.find('.document-viewer');

        if(!this.isModal){
            this.$anchor.empty();
        }
        else {
            this.initModal();
        }




        //set up the document viewer markup
        this.$anchor.append(this.$element);
        this.$inner = this.$element.find(cssSelector.anchor);
        this.innerHorizontalPadding = parseInt(this.$inner.css('padding-right'), 10) + parseInt(this.$inner.css('padding-left'), 10);

        //we need to create an id for the inner element. This is only used by flowplayer
        id = 'document-viewer' + uniqueId();
        this.$inner.attr('id', id);
        this.id = id;



        if (!this.extension) {
            this.extension = getExtension(this.filename);
        }



        if (!this.type) {
            this.type = getType(this.extension);
        }

        //add a class to the document viewer for the current type
        this.$element.addClass(this.type);

        //create a unique event id to be called when this document is loaded
        this.loadEventId = uniqueId();

        this.name = this.filename.split('/').pop(); //todo, use proper method

        if($.isFunction(this.width)){
            this.width = this.width(this);
        }

        this.setSize(options);

        //this.initMenu();

        this.bindCallback();
    };

    DocumentInstance.prototype.initMenu = function(){
        var self = this, menu, $menu;

        menu = '<div class="document-viewer-menu">' +
            '<span class="document-viewer-download">Download</span>' +
            '<span class="document-viewer-expand">Expand</span>' +
            '</div>';

        $menu = $(menu);

        $menu.on('click', '.document-viewer-download', function(){
            self.download();
        });

        $menu.on('click', '.document-viewer-expand', function(){
            self.fullScreen();
        });

        this.$element.append($menu);
    };

    DocumentInstance.prototype.download = function(){
        var iframe;

        //http://stackoverflow.com/questions/3749231/download-file-using-javascript-jquery
        var hiddenIFrameID = 'hiddenDownloader';
        iframe = document.getElementById(hiddenIFrameID);
        if (iframe === null) {
            iframe = document.createElement('iframe');
            iframe.id = hiddenIFrameID;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        iframe.src = this.filename;
    };

    DocumentInstance.prototype.fullScreen = function(){
        if(this.type == 'audio' || this.type == 'video'){
            this.pause();
        }
        var fullScreen =  new DocumentInstance(this.filename, {isModal:true, width:$(window).width() *.95});
        fullScreen.load();
    };

    DocumentInstance.prototype.bindCallback = function(){
        var self = this;

        if (self.callback && $.isFunction(self.callback)) {
            self.$inner.bind(self.loadEventId, self.callback);
        }
    };

    DocumentInstance.prototype.calculateSixteenNine = function(width){
        return Math.round((width / 16) * 9)
    };

    DocumentInstance.prototype.renderPlaceHolder = function(){
        var height = this.getHeight();

        if(this.type == 'video')
            height = (this.height && typeof this.height !== "string") ? this.height : Math.round((this.width / 16) * 9) + playerSizes[this.width].videoPlayerHeight;
        else if (this.type == 'audio'){
            height = playerSizes[this.width].audioPlayerHeight;
        }
        else if(this.type == 'image'){
            height = this.width - this.innerHorizontalPadding;
        }
        else if(this.type === false){

            if(this.setUnsupportedSizeAsSquare === true){
                //if there is no type (unsupported type) OR this is a text/code and text code is disabled, then we want a square
                height = this.width - this.innerHorizontalPadding;
            }
            else height = 'auto';

            this.leavePlaceholder = true;
        }
        else if(((this.type === 'txt' || this.type == 'code') && !this.enableTextAndCode)){
            if(this.setUnsupportedSizeAsSquare === true){
                //if there is no type (unsupported type) OR this is a text/code and text code is disabled, then we want a square
                height = this.width - this.innerHorizontalPadding;
            }
            else height = 'auto';

            this.leavePlaceholder = true;
        }
        else height = '90%';

        this.hasPlaceholder = true;

        var placeholderMarkup = '<div class="document-viewer-placeholder">' +
            '<div class="document-viewer-placeholder-inner">' +
            '<div class="document-icon"></div>' +
            '<div class="placeholder-info">' +
            '<div class="filename">' + this.name + '</div>' +
            '<div class="file-extension">' + this.extension + '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        this.$placeHolder = $(placeholderMarkup).height(height).width(this.width - this.innerHorizontalPadding);
      // this.$placeHolder.html(this.filename);
        this.setContent(this.$placeHolder);
       // this.$element.height(this.$element.height());

    };

    DocumentInstance.prototype.removePlaceholder = function(){
        if(this.hasPlaceholder && !this.leavePlaceholder){
            this.$placeHolder.remove();
        }
    };

    DocumentInstance.prototype.getHeight = function(options, type) {
        var height;

        if (type === 'pdf' || type === 'txt' || type === 'code') {
            height = typeof this.height !== "string" ? this.height : this.width * 1.3;

            if (type == 'pdf')
                height = height + 20;

            if((type == 'txt' || type == 'code') && !this.enableTextAndCode)
                height = 'auto';
        }
        else if (type === 'video') {
//
              height = 'auto';
        }
        else if (type === 'image') {
            height = this.height;
        }
        else if (type === 'audio') {
            height = 'auto';
        }
        else if (type == false){

            height = false;
        }
        else {
            height = 'auto';
        }
        return height;
    };

    DocumentInstance.prototype.setSize = function(options) {
        var type = this.type;

        this.width = this.width || defaultOptions.width;
        this.height = this.getHeight(options, type);


        this.$element.width(this.width + 2); //.find('.dv-markup').width(this.width);

        //pdf.js needs the height of the inner element to be explicitly be set, but tinyscrollbar will break in
        //firefox if the inner height is set
        if (type == 'pdf') {
            this.$inner.height(this.height).parent().height(this.height);
        }
        else if (type === 'txt' || type === 'code') {
            this.$inner.parent().height(this.height);
        }
        else {
            this.$inner.height(this.height).parent().height(this.height);
        }
    };

    DocumentInstance.prototype.unsupportedType = function(){


        //this.$element.addClass('unsupported-type');

        this.triggerLoadedEvent();
    };

    DocumentInstance.prototype.load = function(){
        var self = this,
            loadingIndicatorMarkup = '<div class="dv-loading"></div>';

        this.isLoaded = new $.Deferred();

        //add the loading indicator
        this.$loadingIndicator = $(loadingIndicatorMarkup);
        this.$loadingIndicator.css({
            top:'10%'
        });

        this.$inner.append(this.$loadingIndicator);

        //set the timeout for this file load
        setTimeout(function(){
            self.isLoaded.reject();
        }, self.timeoutValue);


        switch (this.type) {
            case 'pdf':
                this.loadPdf();
                break;
            case 'code':
            case 'txt':
                //the user may not want to use the php dependency required for text and code
                if (this.enableTextAndCode === true) {
                    this.loadText();
                }
                else {
                    this.unsupportedType();
                }
                break;
            case 'video':
                this.loadJPlayer();
                break;
            case 'audio':
                this.loadJPlayer();
                break;
            case 'image':
                this.loadImage();
                break;
            default:
                //TODO: better arguments for error function, perhaps pass in object
                this.unsupportedType();
                break;
        }
    };

    DocumentInstance.prototype.setContent = function($content, isAppend){
        if(isAppend === true){
            this.$inner.append($content);
        }
        else this.$inner.html($content);
    };

    DocumentInstance.prototype.hideLoadingIndicator = function(){
        this.$loadingIndicator.remove();
    };

    DocumentInstance.prototype.getWidth = function(){
        return this.$inner.width();
    };

    DocumentInstance.prototype.triggerLoadedEvent = function(){
        this.removePlaceholder();
        this.$inner.trigger(this.loadEventId);
        this.$loadingIndicator.remove();
        this.isLoaded.resolve();
    };

    DocumentInstance.prototype.error = function(errorCode, errorText){
        //todo:make sure this still works
        var errorMessage = '<br/><span>' + lang.serverResponseText + ' ' + errorCode + ' (' + errorText + ')</span>';


        debugMessage('Error loading file (' + this.filename + '). Please make sure that the path is correct');

        this.setContent('<div class="dv-error">' + lang.errorText + this.type + errorMessage + '</div>');
    };

    DocumentInstance.prototype.loadPdf = function () {
        var self = this,
            pdf,
            currentPage = 1,
            menuMarkup = '<div class="pdf-menu"><div class="prev-page" >Prev Page</div><div class="next-page">Next Page</div><div class="go-to-page"><input> / <span id="pdf-num-pages"></span></div></div>',
            pdfMarkup = menuMarkup + '<div class="pdf-page"></div>',
            $pdfElement = $(pdfMarkup),
            $page = $pdfElement.filter('.pdf-page'),
            $menu = $pdfElement.filter('.pdf-menu'),
            $currentPageInput = $pdfElement.find('input'),
            $nextPage = $pdfElement.find('.next-page'),
            $prevPage = $pdfElement.find('.prev-page'),
            initialLoadComplete = false;

        //bind event handlers for the pdf menu
        $menu.on('click', '.prev-page', function () {
            if (currentPage > 1) {
                setPage(currentPage - 1);
            }
        });

        $menu.on('click', '.next-page', function () {
            if (currentPage < pdf.numPages) {
                setPage(currentPage + 1);
            }
        });

        $menu.on('keyup', 'input', function () {
            var pageNum = parseInt($(this).val(), 10);
            if (pageNum > 0 && pageNum <= pdf.numPages) {
                setPage(pageNum);
            }
        });

        function supports_canvas() {
            return !!document.createElement('canvas').getContext;
        }

        function setNumPages() {
            $menu.find('#pdf-num-pages').text(pdf.numPages);
        }

        function setCurrentPageInput() {
            $currentPageInput.val(currentPage);
        }

        function load(filename) {
            self.setContent($pdfElement);
            PDFJS.workerSrc = self.path + 'libs/pdfjs/pdf.worker.js';
            var promise = PDFJS.getDocument(filename).then(function (thePdf) {
                pdf = thePdf;
                setNumPages();
                setPage(currentPage);
            });

            promise.catch(function (e) {
                self.error(e.target.status, e.target.statusText);
            });
        }

        function setPage(pageNum) {
            currentPage = pageNum;
            $page.find('canvas').remove();
            $page.append(renderPage(pageNum));
            manageMenu();
        }

        function manageMenu() {
            setCurrentPageInput();


            if (isFirstPage()) {
                $prevPage.addClass('disabled');
            }
            else $prevPage.removeClass('disabled');

            if (isLastPage()) {
                $nextPage.addClass('disabled');
            }
            else $nextPage.removeClass('disabled');
        }

        function isFirstPage() {
            return currentPage == 1;
        }

        function isLastPage() {
            return currentPage == pdf.numPages;
        }

        function renderPage(pageNum) {
            var canvas = document.createElement('canvas');
            canvas.id = 'page' + pageNum;

            pdf.getPage(pageNum).then(function (page) {

                var desiredWidth = self.$inner.width();
                var viewport = page.getViewport(1);
                var scale = desiredWidth / viewport.width;
                var scaledViewport = page.getViewport(scale);

                var context = canvas.getContext('2d');
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                var renderContext = {
                    canvasContext:context,
                    viewport:scaledViewport
                };

                page.render(renderContext).then(function(){
                    if(initialLoadComplete === false){
                        initialLoadComplete = true;
                        self.triggerLoadedEvent();

                    }
                });

                //we don't want to wait for rhe page to finish rendering before we hide the loading indicator. We
                //want to hide it as soon as rendering starts. That's why its outside of the promise's then handler.
                if(initialLoadComplete === false){
                    self.hideLoadingIndicator();
                }


            });

            return canvas;
        }

        if (supports_canvas()) {
            loadDependency(['pdfjs'], function () {
                load(self.filename);
            });
        }
        else {
            self.setContent(this.unsupportedBrowserText);
            return;
        }

        return{
            load:load,
            setPage:setPage
        };
    };

    DocumentInstance.prototype.loadText = function () {
        var self = this;

        $.ajax({
            url:self.path + 'libs/getContents.php',
            type:'POST',
            data:{file:self.filename},
            success:function (response) {
                response = $.parseJSON(response);

                if (response.status === 'success') {
                    var $contents = $('<pre class="prettyprint linenums">' + response.response + '</pre>').css('opacity', 0);

                    self.hideLoadingIndicator();

                    //display the text
                    self.setContent($contents);
                    $contents.animate({opacity:1}); //TODO: Put this in a function, $inner.animate


                    if (self.type === 'code') {
                        //enable prettify after the text has loaded
                        loadDependency(['prettify'], function () {
                                prettyPrint();
                        });
                    }

                    self.triggerLoadedEvent();
                }
                else {
                    self.error('404', 'Not Found');
                }
            },
            error:function (e) {
                self.error();
            }
        });
    };

    DocumentInstance.prototype.loadJPlayer = function () {
        var self = this,
            jPlayerOptions, jPlayerDefaults, $myJplayer, cssSelector, isVideo, cssSelectorAncestor;

        //the css selectors from the markup that will be processed by this code
        cssSelector = {
            jPlayer:"#jquery-jplayer-" + self.id,
            jPlayerContainer:'.jPlayer-container',

            playlist:'.playlist',
            playing:'.playing',
            progress:'.progress-wrapper',
            volume:'.volume-wrapper',
            player:'.player'
        };
        cssSelectorAncestor = 'jp-interface-' + self.id;

        jPlayerDefaults = {
            swfPath:self.path + "libs/jPlayer",
            supplied:this.extension,
            solution:'html, flash',
            cssSelectorAncestor:'.' + cssSelectorAncestor,
            errorAlerts:self.debug,
            warningAlerts:self.debug,
            size:{
                //height/width will be reset when buildInterface is called. This is different than the size set in
                //the documentInstance setSize function, because the jPlayer size has to take up the 'available' space
                //not just the width of the document instance. The available space is lessened d
                height:self.height,
                width:self.width,
                cssClass:"show-video"
            },
            sizeFull:{
                width:"100%",
                height:"90%",
                cssClass:"show-video-full"
            },
            play:function(){
                $(this).jPlayer("pauseOthers");
            }
        };


        function buildInterface() {
            var playerMarkup, $interface, width;

            playerMarkup = self.getJPlayerMarkup();

            //Build the html
            $interface = $(playerMarkup).css({opacity:0});

            $interface.find(cssSelector.player).addClass(cssSelectorAncestor);

            self.setContent($interface);


            width = self.getWidth();

            //we need to reset the width of the video container based on the inner width, which factors in padding
            jPlayerOptions.size.width = width;

            //set the height of the container based on the width
            if(isVideo){
                jPlayerOptions.size.height = self.calculateSixteenNine(width);
            }
            else jPlayerOptions.size.height = 0;


            $interface.animate({opacity:1});

            return $interface;
        }

        function load() {

            var $interface;

             //is this video or audio?
            isVideo = $.inArray(self.extension, jPlayerVideoExtensions) !== -1;


            //apply any user defined jPlayer options
            jPlayerOptions = $.extend(true, {}, jPlayerDefaults, self.jPlayer);

            self.hideLoadingIndicator();

            //build the interface
            $interface = buildInterface();

            //initialize jPlayer
            $myJplayer = self.$inner.find('.jPlayer-container');

            $myJplayer.bind($.jPlayer.event.ready, function () {
                var media = {};

                //jPlayer setMedia accepts an object i.e. {mp3:somesong.mp3}, this creates the objec
                media[self.extension] = self.filename;

                $myJplayer.jPlayer("setMedia", media);

                debugMessage('jPlayer Ready');

                if (self.autoPlay) {
                    $myJplayer.jPlayer('play');
                }
            });

            $myJplayer.bind($.jPlayer.event.loadstart, function () {
                self.triggerLoadedEvent();
            });

            $myJplayer.bind($.jPlayer.event.error, function (e) {
                self.error('404', 'Not Found');
            });

            //Initialize jPlayer
            $myJplayer.jPlayer(jPlayerOptions);

            self.$jPlayerAnchor = $myJplayer;
        }

        loadDependency(['jplayer'], function () {
            load();
        });
    };

    DocumentInstance.prototype.getJPlayerMarkup = function(){
        var playerMarkup = '<div class="ttw-video-player">' +
            '<div class="jPlayer-container"></div>' +
            '<div class="clear"></div>' +
            '<div class="player">' +
            '<div class="player-controls">' +
            '<div class="play jp-play button"></div>' +
            '<div class="pause jp-pause button"></div>' +
            '<div class="progress-wrapper">' +
            '<div class="progress-bg">' +
            '<div class="progress jp-seek-bar">' +
            '<div class="elapsed jp-play-bar"></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="volume-wrapper">' +
            '<div class="volume jp-volume-bar">' +
            '<div class="volume-value jp-volume-bar-value"></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<!-- These controls aren\'t used by this plugin, but jPlayer seems to require that they exist -->' +
            '<span class="unused-controls">' +
            '<span class="previous jp-previous"></span>' +
            '<span class="next jp-next"></span>' +
            '<span class="jp-video-play"></span>' +
            '<span class="jp-stop"></span>' +
            '<span class="jp-mute"></span>' +
            '<span class="jp-unmute"></span>' +
            '<span class="jp-volume-max"></span>' +
            '<span class="jp-current-time"></span>' +
            '<span class="jp-duration"></span>' +
            '<span class="jp-repeat"></span>' +
            '<span class="jp-repeat-off"></span>' +
            '<span class="jp-gui"></span>' +
            '<span class="jp-restore-screen"></span>' +
            '<span class="jp-full-screen"></span>' +
            '<span class="jp-no-solution"></span>' + //TODO: I probably want to use this one
            '<span class="jp-playback-rate-bar"></span>' +
            '<span class="jp-playback-rate-bar-value"></span>' +
            '<span class="jp-title"></span>' +
            '</span>' +
            '</div>' +
            '<div class="clear"></div>' +
            '</div>';

        return playerMarkup;
    };

    DocumentInstance.prototype.play = function () {
        this.$jPlayerAnchor.jPlayer("play");
    };

    DocumentInstance.prototype.pause = function () {
        this.$jPlayerAnchor.jPlayer('pause');
    };

    DocumentInstance.prototype.destroyPlayer = function () {
        this.$jPlayerAnchor.jPlayer('destroy');
    };

    DocumentInstance.prototype.loadImage = function () {
        var self = this,
            $img = $('<img class="dv-image">').css('opacity', 0);

        //trigger an error if the image can not be loaded
        $img.error(function (e) {
            self.error('404', 'Not Found');
        });

        //set the image source after we have already created the error handler
        $img.attr('src', this.filename);

        //trigger the loaded event when the image is loaded
        var image = new Image();

        image.onload = function(){
            self.hideLoadingIndicator();

            self.$inner.append($img);
            $img.animate({opacity:1});

            self.triggerLoadedEvent();
        };

        image.src = $img.attr('src');
    };




    //initialize the document viewer
    init();

    return{
        initRender:initRender,
        load:load,
        close:close,
        getDocumentType:getDocumentType,
        getDetails:getDetails,
        setLanguage:setLanguage,
        getPlayerMarkup:getPlayerMarkup,
        testPlayerSizes:testPlayerSizes
    };
};










