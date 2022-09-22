/*
 * jQuery.ReadAll ia a jQuery plugin to shrink large blocks of content and place a read more button below.
 * Created by Anders Fj�llstr�m - anders@morriz.net - http://www.morriz.net
 * For documentation see https://github.com/morriznet/jquery.readall
 * Released under MIT license
 * version 1.1
 */

(function ($) {
  $.fn.readall = function (options) {
    const settings = $.extend(
      {
        // Default values
        showheight: 96, // height to show
        showrows: null, // rows to show (overrides showheight)
        animationspeed: 200, // speed of transition

        btnTextShowmore: 'Read more', // text shown on button to show more
        btnTextShowless: 'Read less', // text shown on button to show less
        btnClassShowmore: 'readall-button', // class(es) on button to show more
        btnClassShowless: 'readall-button', // class(es) on button to show less
      },
      options
    );
    $(this).each(function () {
      const $this = $(this);
      const fullheight = function () {
        return $this[0].scrollHeight;
      };
      const wrapperclass = 'readall-wrapper';
      const hiddenclass = 'readall-hide';
      if (settings.showrows != null) {
        const lineHeight = Math.floor(parseFloat($this.css('font-size')) * 1.5);
        settings.showheight = lineHeight * settings.showrows;
      }
      $this.addClass('readall').css({ overflow: 'hidden' });

      const onResize = function (event) {
        // on resize check if readall is needed
        const _button = $this.parent().find(`button.${settings.btnClassShowmore.replace(/\s+/g, '.')}, button.${settings.btnClassShowless.replace(/\s+/g, '.')}`);
        if (fullheight() > settings.showheight + $(_button).outerHeight()) {
          if (!$(_button).is(':visible') || event == null) {
            $this.css({ height: `${settings.showheight}px`, 'max-height': `${settings.showheight}px` });
            $(_button).text(settings.btnTextShowmore);
            $this.addClass(hiddenclass);
            $(_button).removeClass(settings.btnClassShowless).addClass(settings.btnClassShowmore);
            $(_button).show();
          }
        } else if ($(_button).is(':visible') || event == null) {
          $this.css({ height: '', 'max-height': '' });
          $this.removeClass(hiddenclass);
          $(_button).hide();
        }
      };

      if ($this.parent().not(wrapperclass)) {
        $this.wrap($('<div />').addClass(wrapperclass));
        var _button = $('<button />')
          .addClass(settings.btnClassShowmore)
          .text(settings.btnTextShowmore)
          .on('click', function (e) {
            e.preventDefault();
            if ($this.hasClass(hiddenclass)) {
              $this.css({ height: `${settings.showheight}px`, 'max-height': '' }).animate({ height: `${fullheight()}px` }, settings.animationspeed, () => {
                $this.css({ height: '' });
                $(_button).text(settings.btnTextShowless);
              });
            } else {
              $this.animate({ height: `${settings.showheight}px` }, settings.animationspeed, () => {
                $this.css({ 'max-height': `${settings.showheight}px` });
                $(_button).text(settings.btnTextShowmore);
              });
            }
            $this.toggleClass(hiddenclass);
            $(this).toggleClass(settings.btnClassShowmore).toggleClass(settings.btnClassShowless);
          });
        $this.after(_button);

        $(window).on('orientationchange resize', onResize);

        onResize(null);
      }
    });
    return this;
  };
})(jQuery);
