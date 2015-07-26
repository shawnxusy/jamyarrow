


var InvisibleDom = function(isTestMode){
    var theScrollbarWidth, $dom;

    $dom = $('<div></div>').css({
        display:'block',
        position:'absolute',
        bottom:-99999,
        left:-99999,
        opacity:0
    });

    if(isTestMode === true){
        $dom.css({
            bottom:0,
            left:0,
            opacity:1,
            'z-index':99999
        });
    }

    $('body').append($dom);


    var Element = function($element){
        this.$element = $element;
        this.isAddedToDom = false;

        this.add();
    };

    Element.prototype.add = function(){
        if(!this.isAddedToDom)
            $dom.append(this.$element);
    };

    Element.prototype.getSize = function(){
        var size = {};

        size.height = this.$element.height();
        size.outerHeight = this.$element.outerHeight(true);
        size.width = this.$element.width();
        size.outerWidth = this.$element.outerWidth(true);

        return size;
    };

    Element.prototype.getHorizontalPadding = function(){
        var horizontalPadding = {};

        horizontalPadding.rightPadding = parseInt( this.$element.css('padding-right'), 10);
        horizontalPadding.leftPadding = parseInt( this.$element.css('padding-left'), 10);
        horizontalPadding.total = horizontalPadding.rightPadding + horizontalPadding.leftPadding;

        return horizontalPadding;
    };

    Element.prototype.getHorizontalMargin = function(){
        var horizontalMargin = {};


        horizontalMargin.rightPadding = parseInt( this.$element.css('margin-right'), 10);
        horizontalMargin.leftPadding = parseInt( this.$element.css('margin-left'), 10);
        horizontalMargin.total = horizontalMargin.rightPadding + horizontalMargin.leftPadding;

        return horizontalMargin;
    };

    function destroy(){
        $dom.empty();
        $dom.remove();
    }

    function element($element){
        return new Element($element);
    }

    function scrollbarWidth(){
        var parent,
            child;

        if ( theScrollbarWidth === undefined ) {
            parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
            child = parent.children();
            theScrollbarWidth = child.innerWidth() - child.height( 99 ).innerWidth();
            parent.remove();
        }

        return theScrollbarWidth;
    }

    return {
        element:element,
        scrollbarWidth:scrollbarWidth,
        destroy:destroy
    }
};