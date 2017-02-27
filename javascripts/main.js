$(document).ready(function() {

    zoomedOut = true;
    s = 250;
    angle = 30;
    pages = 22;
    sc = .4;

    $berlin = $('.berlin-prez');
    $berlin.click(function (e) {
        $berlin.toggleClass('active');
    })

    pos = [0];
    for (i = 1; i <= pages; i++) {
      pos.push(pos[i - 1] + s * Math.cos((angle + i + 1)*(Math.PI / 180)));
    }

    hoveredOn = -1;

    function pgNum(cl) {
        return parseInt(cl.substr(1, cl.length)) - 1;
    }

    scrollToPage = function (page) {
      leftOver = 1 - (($('.accordeon-viewer').width() - s) / 2)/s;
      scrollPos = - pos[page] + $('.accordeon-viewer').width() / 2;
      $('[class^=q]').css('transform', function() {
        n = pgNum(this.className);
        return 'translate3d(' + (n + 1 - page - leftOver) * s + 'px, 20px, 0) rotate3d(1, 0, 0, 0deg)';
      });
      hoveredOn = page;
    }

    zoomIn = function() {
      clickedOn = pgNum(this.className);
      if (zoomedOut) {
        $('.accordeon-viewer').addClass('zoomed');
        scrollToPage(clickedOn);
        zoomedOut = false;
      }
    }

    clickToScroll = function() {
      hoveredOn = pgNum(this.className);
      if (!zoomedOut) {
          scrollToPage(hoveredOn);
      }
    }

    onHover = function(e) {
        hoveredOn = pgNum(this.className);
    }

    goBack = function(offset) {
        return function() {
              $('.accordeon-viewer').removeClass('zoomed');
              $('[class^=q]').css('transform', function() {
                n = pgNum(this.className);
                return 'scale3d('+sc + ',' + sc + ',' + sc + ') '+
                       'translate3d(' + (pos[n] + scrollPos) + 'px, 80px, 0) '+
                       'rotate3d(1, 0, 0, 30deg) '+
                       'rotate3d(0, 1, 0,'+ -Math.pow(-1, n % 2) * (angle + n + 1) + 'deg)';
              });
              $('.accordeon-viewer').css('perspective', '600px');
              zoomedOut = true;
        };
    }

    var scrollPos = 0;
    $('[class^=q]').click(zoomIn);
    $('[class^=q]').click(clickToScroll);
    $('.bck').click(goBack(0));

    var lastX;
    var startTime;
    var lastTouchTime;
    var acceleration;
    var momentum = 1;

    $('.accordeon-viewer').bind('touchstart', function(e) {
        lastX = e.originalEvent.touches[0].clientX;
        startTime = $.now();
    });

    $('.accordeon-viewer').bind('touchmove', function(e) {
        currentX = e.originalEvent.touches[0].clientX;
        currentTime = $.now();
        if (lastX !== undefined) {
            d = currentX - lastX;
            scrollToPage(hoveredOn - d / s);

            acceleration = d / (currentTime - startTime);
        }
        lastX = currentX;
        lastTouchTime = currentTime;
    });

    $('.accordeon-viewer').bind('touchend', function(e) {
        currentTime = $.now();
        offset = Math.pow(acceleration, 2);
        moveThreshold = 300;
        if (currentTime - lastTouchTime < moveThreshold) {
            scrollToPage(hoveredOn - momentum * (offset / s));
        }
    });

    function scroll(dir) {
        return function() {
            scrollPos = Math.min($('.accordeon-viewer').width(), Math.max(-4000 + $('.accordeon-viewer').width(), scrollPos + dir * s * sc * .1));

            $('[class^=q]').css('transition', 'transform 0s');
            goBack(scrollPos)();
            $('[class^=q]').css('transition', 'transform .8s ease-in-out, background .8s ease-in-out, opacity .8s ease-in-out');
        }
    }

    var intervalId;
    $('.fwd, .bckwd').hover(function () {
        if (zoomedOut) {
            var intervalDelay = 10;
            intervalId = setInterval(this.className === 'fwd' ? scroll(-1) : scroll(1), intervalDelay);
        }
    }, function () {
        clearInterval(intervalId);
    });
});
