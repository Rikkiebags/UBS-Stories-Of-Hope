function loadData() {

    var randomOrder = randomiseArray(allData.stories.length);
    
    $.each(randomOrder, function(i, v) {
        createStory(allData.stories[v], v);
    });
    
    $("#scroller").width(allData.stories.length * 300);
    
    myScroll = new iScroll('wrapper', {
        vScroll: false,
        vScrollbar: false,
        hScrollbar: false,
        snap: true,
        momentum: false,
        onScrollEnd: function () {
            trackEvent(allData.stories[randomOrder[this.currPageX]].trackingtitle);
        },
        onBeforeScrollStart: function(e) {
            if (!e == undefined)
            {
                point = e.touches[0];
                pointStartX = point.pageX;
                pointStartY = point.pageY;
                null;
            }
        },
        onBeforeScrollMove: function(e) {
            if (!e == undefined)
            {
                deltaX = Math.abs(point.pageX - pointStartX);
                deltaY = Math.abs(point.pageY - pointStartY);
                if (deltaX >= deltaY) {
                    e.preventDefault();
                } else {
                    null;
                }
            }
        }
     });

    trackEvent(allData.stories[randomOrder[0]].trackingtitle);
    
}

function createStory(data, id) {
    
    var storyColor = getRandom(0, color.length - 1);
    
    var $li = $('<li/>', {
        'class' : 'story' + id 
    });
    
    var $imgWrap = $('<div/>', {
        'class' : 'img-wrap'
    }).appendTo($li);

    var $video = $('<div/>', {
        'id' : 'player' + id,
        'class' : 'player'
    }).appendTo($li);

    var $videoPlay = $('<div/>', {
        'class' : 'play'
    });	

    var $loading = $('<div/>', {
        'class' : 'floating-circles',
        'html' : '<div class="f_circleG" id="frotateG_01"></div><div class="f_circleG" id="frotateG_02"></div><div class="f_circleG" id="frotateG_03"></div><div class="f_circleG" id="frotateG_04"></div><div class="f_circleG" id="frotateG_05"></div><div class="f_circleG" id="frotateG_06"></div><div class="f_circleG" id="frotateG_07"></div><div class="f_circleG" id="frotateG_08"></div>'
    });
	
    var $playerOverlay = $('<div/>' , {
       'class' : 'player-overlay overlay' + id 
    }).append($videoPlay).append($loading).appendTo($li);
    
    var $backgroundImg = $('<img/>', {
        'src' : data.thumb[0].img,
        'class' : 'thumb'
    }).appendTo($imgWrap);
    
    $copy = $('<div/>', {
        'class' : 'copy bg-' + color[storyColor],
        'html' : '<h2>' + data.title + '<span>(' + data.subline + ')</span></h2>' + '<p><strong>' + data.summary + '</strong></p>' + data.copy,
    }).appendTo($li);
    
    $li.appendTo("#items");
    
    loadVideo(id);
    
}

function loadVideo(id) {
    
    $(".overlay" + id).click(function() {
        $(".story" + id + " .play").hide();
        $(".story" + id + " .floating-circles").fadeIn();
        $("#player" + id)
            .data("id", id)
            .brightcoveVideo({
                "playerID": allData.stories[id].BrightcovePlayerID,
                "@videoPlayer": allData.stories[id].BrightcoveVideoPlayer,
                "templateReadyHandler": onBrightcoveTemplateReady
        });
    });    
    
}

// Initialize the jQuery Brightcove Video plugin
// On TEMPLATE_READY (The player is ready for interaction through API)
function onBrightcoveTemplateReady( event ) {
    
    var id = $(this).data("id");
    
    $(".story" + id + " .player-overlay").hide(function() {
        $(".story" + id + " .play").show();
        $(".story" + id + " .floating-circles").hide();
    });

    var $player = $(this);
	
    $player.brightcoveVideo("play");

    $player.brightcoveVideo("onMediaEvent", "COMPLETE", function(event) {
        $player.brightcoveVideo("destroy");
        $(".player-overlay").fadeIn();
    });

    $("#destroy").click(function() {
        $(".player").fadeIn();
        $player.brightcoveVideo("destroy");
    })    
    
    trackEvent(allData.stories[id].trackingtitle + "/video");                    
        
}