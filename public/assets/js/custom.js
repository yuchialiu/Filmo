(function ($) {
  // Page loading animation
  $(window).on('load', () => {
    $('#js-preloader').addClass('loaded');
  });

  // WOW JS
  $(window).on('load', () => {
    if ($('.wow').length) {
      const wow = new WOW({
        boxClass: 'wow', // Animated element css class (default is wow)
        animateClass: 'animated', // Animation css class (default is animated)
        offset: 20, // Distance to the element when triggering the animation (default is 0)
        mobile: true, // Trigger animations on mobile devices (default is true)
        live: true, // Act on asynchronously loaded content (default is true)
      });
      wow.init();
    }
  });

  // $(window).scroll(function () {
  //   var scroll = $(window).scrollTop();
  //   var box = $('.header-text').height();
  //   var header = $('header').height();

  //   if (scroll >= box - header) {
  //     $('header').addClass('background-header');
  //   } else {
  //     $('header').removeClass('background-header');
  //   }
  // });

  $('.filters ul li').click(function () {
    $('.filters ul li').removeClass('active');
    $(this).addClass('active');

    const data = $(this).attr('data-filter');
    $grid.isotope({
      filter: data,
    });
  });

  var $grid = $('.grid').isotope({
    itemSelector: '.all',
    percentPosition: true,
    masonry: {
      columnWidth: '.all',
    },
  });

  const width = $(window).width();
  $(window).resize(() => {
    if (width > 992 && $(window).width() < 992) {
      location.reload();
    } else if (width < 992 && $(window).width() > 992) {
      location.reload();
    }
  });

  $(document).on('click', '.naccs .menu div', function () {
    const numberIndex = $(this).index();

    if (!$(this).is('active')) {
      $('.naccs .menu div').removeClass('active');
      $('.naccs ul li').removeClass('active');

      $(this).addClass('active');
      $('.naccs ul').find(`li:eq(${numberIndex})`).addClass('active');

      const listItemHeight = $('.naccs ul').find(`li:eq(${numberIndex})`).innerHeight();
      $('.naccs ul').height(`${listItemHeight}px`);
    }
  });

  $('.owl-features').owlCarousel({
    items: 3,
    loop: true,
    dots: false,
    nav: true,
    autoplay: true,
    margin: 30,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      1200: {
        items: 3,
      },
      1800: {
        items: 3,
      },
    },
  });

  $('.owl-collection').owlCarousel({
    items: 3,
    loop: true,
    dots: false,
    nav: true,
    autoplay: true,
    margin: 30,
    responsive: {
      0: {
        items: 1,
      },
      800: {
        items: 2,
      },
      1000: {
        items: 3,
      },
    },
  });

  $('.owl-banner').owlCarousel({
    items: 1,
    loop: true,
    dots: false,
    nav: true,
    autoplay: true,
    margin: 30,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      1000: {
        items: 1,
      },
    },
  });

  // Menu Dropdown Toggle
  if ($('.menu-trigger').length) {
    $('.menu-trigger').on('click', function () {
      $(this).toggleClass('active');
      $('.header-area .nav').slideToggle(200);
    });
  }

  // Menu elevator animation
  $('.scroll-to-section a[href*=\\#]:not([href=\\#])').on('click', function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      let target = $(this.hash);
      target = target.length ? target : $(`[name=${this.hash.slice(1)}]`);
      if (target.length) {
        const width = $(window).width();
        if (width < 991) {
          $('.menu-trigger').removeClass('active');
          $('.header-area .nav').slideUp(200);
        }
        $('html,body').animate(
          {
            scrollTop: target.offset().top - 80,
          },
          700
        );
        return false;
      }
    }
  });

  $(document).ready(() => {
    $(document).on('scroll', onScroll);

    // smoothscroll
    $('.scroll-to-section a[href^="#"]').on('click', function (e) {
      e.preventDefault();
      $(document).off('scroll');

      $('.scroll-to-section a').each(function () {
        $(this).removeClass('active');
      });
      $(this).addClass('active');

      var target = this.hash;
      const menu = target;
      var target = $(this.hash);
      $('html, body')
        .stop()
        .animate(
          {
            scrollTop: target.offset().top - 79,
          },
          500,
          'swing',
          () => {
            window.location.hash = target;
            $(document).on('scroll', onScroll);
          }
        );
    });
  });

  function onScroll(event) {
    const scrollPos = $(document).scrollTop();
    $('.nav a').each(function () {
      const currLink = $(this);
      const refElement = $(currLink.attr('href'));
      if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
        $('.nav ul li a').removeClass('active');
        currLink.addClass('active');
      } else {
        currLink.removeClass('active');
      }
    });
  }

  // Page loading animation
  $(window).on('load', () => {
    if ($('.cover').length) {
      $('.cover').parallax({
        imageSrc: $('.cover').data('image'),
        zIndex: '1',
      });
    }

    $('#preloader').animate(
      {
        opacity: '0',
      },
      600,
      () => {
        setTimeout(() => {
          $('#preloader').css('visibility', 'hidden').fadeOut();
        }, 300);
      }
    );
  });

  const dropdownOpener = $('.main-nav ul.nav .has-sub > a');

  // Open/Close Submenus
  if (dropdownOpener.length) {
    dropdownOpener.each(function () {
      const _this = $(this);

      _this.on('tap click', (e) => {
        const thisItemParent = _this.parent('li');
        const thisItemParentSiblingsWithDrop = thisItemParent.siblings('.has-sub');

        if (thisItemParent.hasClass('has-sub')) {
          const submenu = thisItemParent.find('> ul.sub-menu');

          if (submenu.is(':visible')) {
            submenu.slideUp(450, 'easeInOutQuad');
            thisItemParent.removeClass('is-open-sub');
          } else {
            thisItemParent.addClass('is-open-sub');

            if (thisItemParentSiblingsWithDrop.length === 0) {
              thisItemParent.find('.sub-menu').slideUp(400, 'easeInOutQuad', () => {
                submenu.slideDown(250, 'easeInOutQuad');
              });
            } else {
              thisItemParent
                .siblings()
                .removeClass('is-open-sub')
                .find('.sub-menu')
                .slideUp(250, 'easeInOutQuad', () => {
                  submenu.slideDown(250, 'easeInOutQuad');
                });
            }
          }
        }

        e.preventDefault();
      });
    });
  }
})(window.jQuery);
