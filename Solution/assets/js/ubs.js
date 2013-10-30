var numContainers,      //Number of thumbnail containers
    order = [],         //Array of order of thumbnails
    containerOrder = [],//Order of containers
    currContainer = 0,  //Current placement in container
    thumbExpand = 300,  //Size to expand thumbnails to
    expandSpeed = .25,  //Speed at which to expand thumbnails
    zIndexTop = 100,    //Z-index
    storyCount = -1,     //Keep count of current/next story in array
    timer,               //Global timer
    maskCount = 0,
    canvasWidth,
    canvasHeight,
    navPos = 548
    
function preLoadImages()
{
    //==============
    //Preload images
    //==============
    //Get a single array of all the images to preload
    
    var imagePreLoad = [];
    
    $.each(allData.stories, function(i, value) {
        
        $.each(allData.stories[i].thumb, function(i2, value) {
            imagePreLoad.push(allData.stories[i].thumb[i2].img);
        });
        
    });
    
    imageCache.pushArray(imagePreLoad, imageLoaded, allImagesLoaded);
    
}

function allImagesLoaded() {
    
    //testStory(0);
    
    canvasWidth = $(".viewport").width();
    canvasHeight = $(".viewport").height();    
    
    initContainers(allData.structure);
    initStories(allData.stories);
    
    $(".loading").fadeOut(function() {
        $(this).remove();
    });
    
    trackEvent();
}

/*function testStory(id) {
    
    //SHOW TRANSITION TO STORY PAGE
    var canvasWidth = $(".viewport").width();
    var canvasHeight = $(".viewport").height();

    var $transition = $('<div/>', {
       css : {
            'left': 0,
            'top': 0,
            'width': canvasWidth,
            'height': canvasHeight,
            'visibility': 'visible'
       },
       'class' : 'transition'
    });
        
    $(".viewport").append($transition);
        
    loadStory(id);
    
}*/

// Initialise container divs
function initContainers(data) {
    
    //Choose a random container structure
    var rnd = getRandom(0, data.length -1);

    $.each(data[rnd].containers.container, function (i, v) {
        
        var $div = $('<div/>', {
            css : {
                left : v.left,
                top : v.top,
                width : v.width,
                height : v.height
            },
            data : {
                'height' : v.height,
                'width' : v.width,
                'left' : v.left,
                'top' : v.top
            },
            'class' : 'story story' + i
        });
        
        numContainers = data[rnd].containers.container.length;
        
        $div.appendTo(".viewport");
        
    });
}

// Initialise stories
function initStories(data) {

    //Randomise the order    
    order = randomiseArray(data.length);
    //console.log(order);

    var loadCount = 0;
    
    for (var x=0; x<=numContainers; x++)
    {
        createNewStory(x, order[x], function (result) {
            
            loadCount++;
            
            //console.log("CALLBACK: " + result);
            result = "";

            if (loadCount == numContainers) {
                
                //console.log("PERFORMING INITIAL FINAL LOAD");
                
                //Perform initial animation
                containerOrder = randomiseArray(numContainers);
                
                var tlIntro = new TimelineMax({onComplete:initialiseTimer});
                for (var x=0; x<numContainers; x++) {
                    var $cropAnim = $(".story" + containerOrder[x] + " .img-crop");
                    var animSpeed = (Math.floor(Math.random()*6 + 3)) / 10;
                    //console.log("CROP ANIM: " + containerOrder[x] + " data left: " + $cropAnim.data('left'));
                    tlIntro.add(TweenMax.to($cropAnim, animSpeed, {
                        left : $cropAnim.data('left'),
                        top : $cropAnim.data('top'),
                        ease : Circ.easeOut}), "-=.3");
                }
                
                $(".story").mouseenter(function() {
                     
                    var $container = $(this);
                    var $mask = $container.find(".img-crop");
                    var scaleHeight = thumbExpand;
                    var scaleWidth = thumbExpand;
                    var scaleCropHeight = thumbExpand;
                    var scaleCropWidth = thumbExpand;
                    var pos = $container.position();
                    var top;
                    var left;
                    
                    if ($container.width() > $container.height()) {
                        scaleHeight = Math.floor((thumbExpand / $container.width()) * $container.height());
                        scaleCropHeight = Math.floor((thumbExpand / $mask.width()) * $mask.height());
                    }
                    else
                    {
                        scaleWidth = Math.floor((thumbExpand / $container.height()) * $container.width());
                        scaleCropWidth = Math.floor((thumbExpand / $mask.height()) * $mask.width());
                    }
                     
                    var widthOffset = Math.floor((scaleWidth - $container.width()) / 2);
                    var heightOffset = Math.floor((scaleHeight - $container.height()) / 2);
            
                    $container.addClass("current");   
                     $(".viewport .story:not(.current)").addClass("effect");
                     
                    // Ensure expanded thumbnails don't go offscreen
                    top = pos.top - heightOffset
                    if (top < 0) {
                        top = 0;
                    }
                    if (top + scaleHeight > navPos) {
                        top = navPos - scaleHeight;
                    }
                    left = pos.left - widthOffset;
                    if (left + scaleWidth > canvasWidth)
                    {
                        left = canvasWidth - scaleWidth;
                    }
                    if (left < 0) {
                        left = 0;
                    }
                     
                    var tl = new TimelineMax();
                    tl.add(TweenMax.to($container, expandSpeed, {
                        width : scaleWidth, 
                        height : scaleHeight, 
                        left: left,
                        top: top,
                        ease : Circ.easeOut}));
                    tl.add(TweenMax.to($mask, expandSpeed, {
                        width : scaleCropWidth, 
                        height : scaleCropHeight,
                        ease : Circ.easeOut}), "-=.25");
                    tl.play();
                     
                    bringToFront($container);
                    
                    $container.find(".content .cta").show();
                    $container.find(".content").delay(250).slideDown();
                     
                    pauseTimer();
                     
                 })
                 .mouseleave(function() {
                     
                     var $container = $(this);
                     var $mask = $container.find(".img-crop");
                     
                     var tl = new TimelineMax();
                     tl.add(TweenMax.to($container, expandSpeed, {
                         width : $container.data('width'),
                         height : $container.data('height'),
                         left : $container.data('left'),
                         top : $container.data('top'),
                         ease : Circ.easeOut
                     }));
                     tl.add(TweenMax.to($mask, expandSpeed, {
                         width : $mask.data('width'),
                         height : $mask.data('height'),
                         left : $mask.data('left'),
                         top : $mask.data('top'),
                         ease : Circ.easeOut}), "-=.25");
                     tl.play();
                    
                     $container.find("img").removeClass("over");
                     $container.find(".content .cta").hide();
                     $container.find(".content").stop(true, false).slideUp();
                     $container.removeClass("current");
                     
                     $(".viewport .story").removeClass("effect");
                     
                     initialiseTimer();
            
                })
                .click(function() {
                    
                    //SHOW TRANSITION TO STORY PAGE
            
                    //Duplicate div and expand
                    var $container = $(this);
                    var pos = $container.position();
                    var transitionColor = $container.find(".content").data("color");
                    
                    var $transition = $('<div/>', {
                           css: {
                                left: pos.left,
                                top: pos.top,
                                width: $container.width(),
                                height: $container.height()
                           },           
                           'class': 'transition bg-' + color[transitionColor]
                        });
                        
                    var transitionReverseComplete = function() {
                        $(".transition").remove();
                        //initialiseTimer(); 
                    };
                        
                    var transitionTween = new TweenMax.to($transition, .5, {
                        top : 0, 
                        left : 0, 
                        width : canvasWidth,
                        height : canvasHeight,
                        autoAlpha : 1, 
                        ease : Quad.easeIn,
                        onComplete : loadStory,
                        onCompleteParams : [$container.data('id'), transitionColor],
                        onReverseComplete : transitionReverseComplete
                    });
            
                    var $closeContentButton = $('<div/>', {
                            'class': 'closecontent'
                        })
                        .click(function() {
                            $(".transition .story-detail").remove();
                            initContainers(allData.structure);
                            initStories(allData.stories);
                            $closeContentButton.hide();
                            transitionTween.reverse();
                            initialiseTimer();
                        }); 
                   
                    $closeContentButton.appendTo($transition);
                    $(".viewport").append($transition);
                    $closeContentButton.show();
                    pauseTimer();
                    
                })
            
            }
            
        });
    }
    
}

function loadStory(id, storyColor) {
    
    //console.log("SHOWING: " + id);
    
    //Empty the thumbnails
    $(".story").remove();
    
    var $story = $('<div/>', {
        'class' : 'story-detail'
    });
   
    var $backgroundImg = $('<img/>', {
        'class' : 'bg',
        'css' : {
            'position' : 'absolute',
            'visibility' : 'hidden'
        }
    }).appendTo($story);
    
    var $storyCopy = $('<div/>', {
        'class' : 'story-copy'
    });
    
    var $header = $('<header/>', {
        'class' : 'bg-' + color[storyColor]
    }).appendTo($storyCopy);
	
	var $h1Subline = $('<span>', {
        'text' : '(' + allData.stories[id].subline + ')'
    });
    
    var $h1 = $('<h1>', {
        'text' : allData.stories[id].title
    }).append($h1Subline);

    
    var $h2 = $('<h2>', {
       'text' : allData.stories[id].summary 
    });
    
    var $article = $('<article/>');
    
    var $h3 = $('<h3>', {
        'text' : allData.stories[id].leadline
    });
    
    var $p = $('<div/>', {
        'html' : allData.stories[id].copy
    });

    var $videoPlay = $('<div/>', {
        'class' : 'play'
    });
    
    var $loading = $('<div/>', {
        'class' : 'floating-circles',
        'html' : '<div class="f_circleG" id="frotateG_01"></div><div class="f_circleG" id="frotateG_02"></div><div class="f_circleG" id="frotateG_03"></div><div class="f_circleG" id="frotateG_04"></div><div class="f_circleG" id="frotateG_05"></div><div class="f_circleG" id="frotateG_06"></div><div class="f_circleG" id="frotateG_07"></div><div class="f_circleG" id="frotateG_08"></div>'
    });
     
    var $videoOverlay = $('<div/>', {
        'class' : 'player-overlay'
    }).append($videoPlay).append($loading);
    
    var $videoPlayer = $('<div/>' , {
       'class' : 'player' 
    });
        
    $h1.appendTo($header).after($h2);
    $article.append($h3).append($p).appendTo($storyCopy);
    $storyCopy.appendTo($story);
    $videoPlayer.appendTo($story);
    $videoOverlay.appendTo($story);
    $(".transition").append($story);
    
    initVideo(id);

    loadImageGallery(id, storyColor);
    
    trackEvent(allData.stories[id].trackingtitle);
    
    //Ensure transition color is the same (for next/prev)
    var transitionColor = function() {
        $(".transition")
            .removeClass (function (index, css) {
                return (css.match (/\bbg-\S+/g) || []).join(' ');
            })
            .addClass("bg-" + color[storyColor]);        
    }
    
    $backgroundImg.load(function() {
        TweenMax.to($(".transition .bg"), 2, {
            css : {autoAlpha : 1},
            onComplete: transitionColor
        });
    }).attr('src', allData.stories[id].img);
    
    $(".story-copy").slideDown(1000);
    
    TweenMax.to($(".player-overlay"), 1, {
        delay : 1,
        css : {autoAlpha : 1}
    });
    
    //Navigation within story
    var $next = $('<a/>', {
        'href' : '#',
        'class' : 'next story-nav',
        'text' : 'Next',
        'css' : {'visibility' : 'hidden'}
    })
    .click(function() {
        pos = order.indexOf(id);
        id = pos >= allData.stories.length -1 ? order[0] : order[pos + 1];
        storyNavigation(canvasWidth * -1, id);
        return false;
    })
    .appendTo($story);
    
    var $prev = $('<a/>', {
        'href' : '#',
        'class' : 'prev story-nav',
        'text' : 'Previous',
        'css' : {'visibility' : 'hidden'}
    })
    .click(function() {
        pos = order.indexOf(id);
        id = pos == 0 ? order[order.length - 1] : order[pos - 1];
        storyNavigation(canvasWidth, id);
        return false;
    })
    .appendTo($story);
    
    TweenMax.to($(".story-nav"), 2, {
        css : {autoAlpha : 1}
    });    
    
}

function storyNavigation(leftPos, id) {
    
    $(".story-nav").remove();    
    
    var clearStory = function() {
        $(".story-detail").remove();
        loadStory(id, getRandom(0, color.length - 1));  
    }
    
    TweenMax.to($(".story-detail"), .75, {
        left : leftPos, 
        ease : Quad.easeOut,
        onComplete : clearStory,
        onCompleteParams : [id]
    });
}

function initVideo(id) {
    
    $(".player-overlay").click(function() {
        $(".play").hide();
        $(".floating-circles").fadeIn();
        $( ".player" ).brightcoveVideo({
            "playerID": allData.stories[id].BrightcovePlayerID,
            "@videoPlayer": allData.stories[id].BrightcoveVideoPlayer,
            "templateReadyHandler": onBrightcoveTemplateReady
        });
    });
}

// Initialize the jQuery Brightcove Video plugin
// On TEMPLATE_READY (The player is ready for interaction through API)
function onBrightcoveTemplateReady( event ) {
    
    $(".player-overlay").hide(function() {
        $(".play").show();
        $(".floating-circles").hide();
    });

    var $player = $(this);
    $player.brightcoveVideo("play");
    fadeBackground(false);

    $player.brightcoveVideo("onMediaEvent", "COMPLETE", function(event) {
        $player.brightcoveVideo("destroy");
        fadeBackground(true);
        $(".player-overlay").fadeIn();
    });

    $player.brightcoveVideo("onMediaEvent", "PLAY", function(event) {
        fadeBackground(false);
    });        
    
    $player.brightcoveVideo("onMediaEvent", "STOP", function(event) {
        fadeBackground(true);
    });
    
    $("#destroy").click(function() {
        fadeBackground(false);
        $(".player").fadeIn();
        $player.brightcoveVideo("destroy");
    })    
    
    trackEvent(allData.stories[id].trackingtitle + "/video");                    
        
}

function fadeBackground(show) {
    
    var alpha = (show) ? 1 : .5;
    TweenMax.to($(".transition .bg"), .5, {
        css : {autoAlpha : alpha}
    });
    
}

function loadImageGallery(id, storyColor) {
    
    $.each(allData.stories[id].gallery, function(index, value) {
        
        var maxThumbSide = 130;
        var galleryTop = 410;
        var maxSideSize = 500;
        var transitionTween;
        var topOffset = 0;
        
        var $galleryImg = $('<img/>', {
            'class' : 'gallery-item',
            'css' : {
                'visibility' : 'hidden'
            }
        }).appendTo($(".story-detail"));
        
        if (this.caption != undefined) {
            var $imageCaption = $('<div/>', {
                'class' : 'caption bg-' + color[storyColor],
                'html' : "<span>" + this.caption + "</span>"
            });
        }
        
        var clickFunction = function($imgContainer) {
            
            var pos = $imgContainer.position();
            var width = $imgContainer.width();
            var height = $imgContainer.height() - 2;
            var scaleHeight = maxSideSize;
            var scaleWidth = maxSideSize;
            if (width > height) {
                scaleHeight = Math.floor((maxSideSize / width) * height);
            }
            else
            {
                scaleWidth = Math.floor((maxSideSize / height) * width);
            }
            var widthOffset = Math.floor((scaleWidth - width) / 2);
            var heightOffset = Math.floor((scaleHeight - height) / 2);   
            var top = pos.top - heightOffset;
            var left = pos.left - widthOffset;    
            if (pos.top + scaleHeight > canvasHeight)
            {
                top = navPos - scaleHeight - 8;
            }
            if (pos.left + scaleWidth > canvasWidth)
            {
                left = canvasWidth - scaleWidth - 10;
            }
            
            bringToFront($imgContainer);
            
            var showCaption = function($container) {
                $caption = $container.find(".caption");
                $img = $container.find(".gallery-item");
                $caption.width($img.width()).slideDown();
                $imgContainer.data('expanded', true);
            };
            
            transitionTween = new TweenMax.to($imgContainer, .25, {
                width : scaleWidth,
                height : scaleHeight,
                top : top,
                left : left, 
                ease : Quad.easeOut,
                onComplete : showCaption,
                onCompleteParams : [$imgContainer]
            });            
        }
        
        var hideCaptionAndReverse = function($target) {
            $caption = $target.find(".caption");
            $caption.hide();
            $target.data('expanded', false);
            
            transitionTween = new TweenMax.to($target, .25, {
                width : $target.data('width'),
                height : $target.data('height'),
                top : $target.data('top'),
                left : $target.data('left'), 
                ease : Quad.easeOut
            });            
            //transitionTween.reverse();
        };
        
        var $imageWrapper = $('<div/>', {
            'class' : 'gallery',
            'css' : {
                'visibility' : 'visible'
            }
        }).mouseenter(function() {
            
            clickFunction($(this));
            
        }).click(function() {
            
            //Added for touch events
            if ($(this).data('expanded') == true) {
                hideCaptionAndReverse($(this));  
            }
            else
            {
                clickFunction($(this));
            }
            
        }).mouseleave(function() {
            
            hideCaptionAndReverse($(this));
            
        });
        
        //ON IMAGE LOADED
        $galleryImg.load(function() {
            
            if ($galleryImg.width() > $galleryImg.height())
            {
                $imageWrapper.width(maxThumbSide);
                $imageWrapper.height($galleryImg.height() / ($galleryImg.width() / maxThumbSide));
                
            }
            else 
            {
                $imageWrapper.height(maxThumbSide);
                $imageWrapper.width($galleryImg.width() / ($galleryImg.height() / maxThumbSide));
            }
            
            $imageWrapper.css({'top' : canvasHeight});
            
            $imageWrapper.append($galleryImg).appendTo($(".story-detail")).append($imageCaption);
            
            var wrapPos = $imageWrapper.position();

            if ($imageWrapper.width() > $imageWrapper.height()) {
                var wrapOffset = $imageWrapper.height() - ($imageWrapper.width() / 2);
                $imageWrapper.data({'top' : galleryTop + wrapOffset});
            }
            else
            {
                $imageWrapper.data({'top' : galleryTop});
            }
            
            //See if all gallery items are loaded, then calculate horizontal centering
            if ($(".gallery").length == allData.stories[id].gallery.length)
            {
                var galleryMargin = 20;
                var tlGallery = new TimelineMax({delay : 1.5});
                
                $.each($(".gallery"), function(i, v) {
                    var galleryPos = $(this).position();
                    var leftPos = 920;
                    if(i > 0) {
                        $prev = $(".pic" + (i-1));
                        pos = $prev.position();
                        leftPos = pos.left - $(this).width() - galleryMargin;
                    }
                    else {
                        leftPos = leftPos - $(this).width();
                    }
                    
                    $(this).css({'left' : leftPos }).addClass("pic" + i);
                    
                    $(this).find(".gallery-item").css("visibility", "visible");
                    
                    tlGallery.add(TweenMax.to($(this), .5, {
                        top : $(this).data('top'),
                        ease : Circ.easeOut}), "-=.25");    
                        
                    //For some reason tween.reverse not working correctly on touch device, 
                    //so setting data and explicitly tweening back
                    $(this).data({
                        'width' : $(this).width(),
                        'height' : $(this).height(),
                        'top' : $(this).data('top'),
                        'left' : leftPos 
                    });
                });
            }
        }).attr('src', this.img);
        
   });    
    
}

function initialiseTimer() {
    //console.log("INIT TIMER");
    if (!$(".transition").length)
    {
        clearInterval(timer);
        timer = setInterval(function(){
            changeImage();
            stopAndRestartTimer();
        },getRandom(100, 3000));
    }
}

function stopAndRestartTimer() {
    initialiseTimer();
}

function pauseTimer() {
    clearInterval(timer);
}

function changeImage() {
    
    //Pick a random container
    targetContainer = containerOrder[currContainer];
    currContainer++;
    if (currContainer >= containerOrder.length) currContainer = 0;
    
    var $removeCrop = $(".story" + targetContainer + " .img-crop");
    var $removeContent = $(".story" + targetContainer + " .content");
    var emptyContent = function() {
        $removeCrop.remove();
        $removeContent.remove();
    }
    
    createNewStory(targetContainer, order[storyCount], function($cropAnim) {
        TweenMax.to($cropAnim, .5, {left : $cropAnim.data('left'), top : $cropAnim.data('top'), ease : Circ.easeOut, onComplete : emptyContent});
    });

}

function createNewStory(containerID, storyID, callback) {
    
    //console.log("storyID: " + storyID);
    
    //Set the color for this story
    var storyColor = getRandom(0, color.length - 1);
 
    //Pick a random image
    var randomThumb = getRandom(0, allData.stories[storyID].thumb.length - 1);
    
    //Create image
    var $img = $('<img/>', {
        'class' : 'hidden thumb thumb' + storyID
    });
    
    //Create pop up text
    var $content = $('<div/>', {
        'class': 'content content' + maskCount + ' bg-' + color[storyColor],
        'data' : {'color' : storyColor}
    });
    
    var $contentText = $('<div/>', {
        'html': '<h2>' + allData.stories[storyID].title + '</h2><p>' + allData.stories[storyID].summary + '</p>',
        'class' : 'cta'
    });
    
    var $container = $(".story" + containerID);
    
    $img.appendTo($container);
    $container.data({'id' : storyID});     //Add ID to story container
    
    $img.load(function() {
        
        //Create temp image to get real height
        var tempImage = new Image();
        tempImage.src = $img.attr("src");
        $img.data({
            'height' : tempImage.height,
            'width' : tempImage.width
        });
        delete tempImage;
        
        //Create parent 'crop' div
        var $parent = $img.parent();
        var cropWidth = $parent.width();
        var cropHeight = $parent.height();
        var cropTopOffset = 0;
        var cropLeftOffset = 0; 
        
        if ($parent.width() > $parent.height()) {
            //Landscape - calculate scaled height
            cropHeight = Math.floor($img.data('height') * (cropWidth / $img.data('height')));
            cropTopOffset = Math.floor(((cropHeight - $parent.height()) / 2) * -1);
        } 
        else
        {
            //Portrait - calculate scaled width
            cropWidth = Math.floor($img.data('width') * (cropHeight / $img.data('width')));
            cropLeftOffset = Math.floor(((cropWidth - $parent.width()) / 2) * -1);
        }
        
        var initTop = cropTopOffset, 
            initLeft = cropWidth;
        switch (getRandom(1, 4))  // Top, Right, Bottom, Left 
        {
            case 1:
                initTop = cropHeight * -1;
                initLeft = cropLeftOffset;
                break;
            case 2:
            
                break;
            case 3:
                initLeft = cropLeftOffset;
                initTop = cropTopOffset + cropHeight;
                break;
            case 4:
                initLeft = cropWidth * -1;
                break;
            default:
                break;
        }    
        
        var $crop = $('<div/>', {
            css : {
                height : cropWidth,
                width : cropHeight,
                top : initTop,
                left : initLeft
            },
            data : {
                'height' : cropHeight,
                'width' : cropWidth,
                'left' : cropLeftOffset,
                'top' : cropTopOffset
            },
            'class' : 'img-crop crop' + maskCount
        });
        
        $crop.append($img);
        $contentText.appendTo($content);
        $container.append($crop);
        $container.append($content);
    
        increaseCurrentStory();
        
        $img.removeClass("hidden");
        
        callback($crop);       
        
    }).attr('src', allData.stories[storyID].thumb[randomThumb].img);
 
}

function increaseCurrentStory() {

    storyCount++;
    maskCount++;
    if (storyCount > order.length -1) storyCount = 0;
    
}

function bringToFront($obj) {

    $obj.css({'z-index': zIndexTop});
    zIndexTop++;

};

/*
 * imageCache.js - image caching framework.
 * Zoltan Hawryluk - http://www.useragentman.com/
 * MIT License.
*/
function imageLoaded() {
}

var imageCache = new function () {
    var me = this;

    var cache = [];
    var root = document.location.href.split('/');

    root.pop();
    root = root.join('/') + '/';

    me.push = function (src, loadEvent) {

        if (!src.match(/^http/)) {
            src = root + src;
        } 

        var item = new Image();

        if (cache[src] && loadEvent) {
            loadEvent(src);
        } else {
            if (loadEvent) {
                item.onload = loadEvent;
                item.onerror = loadEvent;
            }
            cache[src]=item;
        }

        item.src =  src;
    }

    me.pushArray = function (array, imageLoadEvent, imagesLoadEvent) {
        var numLoaded = 0;
        var arrayLength = array.length;
        for (var i=0; i<arrayLength; i++) {
            me.push(array[i], function (e) {
                if (imageLoadEvent) {
                    imageLoadEvent(e);
                }
                numLoaded++;
                if (numLoaded == arrayLength) {
                    setTimeout(function () {
                        imagesLoadEvent(e);
                    }, 1)
                }
            })
        }
    }
}

//IE8 fix for lact of .indexOf support
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (obj, fromIndex) {
    if (fromIndex == null) {
        fromIndex = 0;
    } else if (fromIndex < 0) {
        fromIndex = Math.max(0, this.length + fromIndex);
    }
    for (var i = fromIndex, j = this.length; i < j; i++) {
        if (this[i] === obj)
            return i;
    }
    return -1;
  };
}