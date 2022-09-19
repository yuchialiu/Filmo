/* ========================================================================= *\
	vmcarousel plugin by Vedmant
\* ========================================================================= */

(function ($, window, document, undefined) {
  const pluginName = 'vmcarousel';

  /**
   * Defaults
   *
   * @type {}
   */
  const defaults = {
    delay: 4000,
    speed: 500,
    autoplay: true,
    items_to_show: 0, // 0 for auto calc
    min_items_to_show: 2,
    items_to_slide: 1,
    dont_cut: true,
    centered: false,
    start_item: 0,
    start_item_centered: false,
    infinite: false,
    changed_slide: $.noop(),
  };

  /**
   * Plugin constructor
   *
   * @param element
   * @param options
   * @constructor
   */
  function Plugin(element, options) {
    this._name = pluginName;
    this.element = element;
    this.$element = $(element);
    const data_options = parse_data_options(this.$element.data('options'));
    this.options = $.extend({}, defaults, options);
    this.options = $.extend({}, this.options, data_options);
    this.init();
  }

  /**
   * Parse data-options attribute options
   *
   * @param data_options_raw
   * @returns {Array}
   */
  function parse_data_options(data_options_raw) {
    if (data_options_raw === undefined) return [];
    const options = [];
    data_options_raw.split(';').forEach((el) => {
      const pair = el.split(':');
      if (pair.length == 2) options[pair[0].trim()] = pair[1].trim();
    });
    return options;
  }

  /**
   * Plugin functions
   */
  Plugin.prototype = {
    /**
     * Plugin init
     */
    init() {
      const that = this;

      // Add class
      this.$element.addClass('vmcarousel');

      // Wrap
      this.$viewport = this.$element.wrap('<div class="vmc-viewport"></div>').parent();
      this.$container = this.$viewport.wrap('<div class="vmc-container"></div>').parent();

      // Some initial procedures with slides
      this.init_slides();

      // Items vars
      this.$orig_items = this.$element.find('>li');
      this.$items = this.$orig_items;
      this.orig_items_count = this.$orig_items.length;
      this.items_count = this.$items.length;
      this.orig_item_width = this.$items.outerWidth(true);
      this.item_width = this.orig_item_width;

      // Other vars
      this.current_position = 0;

      // Init functions
      this.calc_variables();
      this.init_infinite(this.options.start_item);
      this.init_controls();
      this.update_state();

      // Reorder slides to make start item at the center
      if (this.options.start_item_centered) this.reorder_to_center(this.options.start_item);

      // Initial set slide
      if (!this.options.infinite) this.set_slide(this.options.start_item);
      else this.set_active_infinite(this.options.start_item);

      // Start timer
      if (this.options.autoplay) this.start_timer();

      // Window resize event
      $(window).resize(() => {
        that.resize();
      });
    },

    /**
     * Calculate all needed variables
     */
    calc_variables() {
      this.viewport_width = this.$viewport.width();

      // Calc items to show
      this.items_to_show = this.options.items_to_show;
      if (!this.options.items_to_show || this.orig_item_width * this.items_to_show > this.viewport_width) {
        this.items_to_show = Math.floor(this.viewport_width / this.orig_item_width);
      }

      // Set odd number for centered type for not to cut items
      if (this.options.centered && this.options.dont_cut) {
        this.items_to_show = this.items_to_show % 2 ? this.items_to_show : this.items_to_show - 1;
      }

      // Min items to show
      if (this.items_to_show < this.options.min_items_to_show) this.items_to_show = this.options.min_items_to_show;

      // Calc item width for centered or dont_cut
      if (this.options.centered || this.options.dont_cut) {
        this.item_width = Math.floor(this.viewport_width / this.items_to_show);
        if (this.item_width < this.orig_item_width) this.item_width = this.orig_item_width;
        this.$items.width(this.item_width);
        this.full_items_width = this.item_width * this.items_count;
        this.$element.css({ width: `${this.full_items_width}px` });
      }

      // Calc items to slide
      this.items_to_slide = this.options.items_to_slide;
      if (!this.options.items_to_slide) this.items_to_slide = Math.floor(this.viewport_width / this.item_width);
      if (this.items_to_slide > this.items_to_show) this.items_to_slide = this.items_to_show;

      if (this.items_to_slide <= 0) this.items_to_slide = 1;

      this.hide_controls = this.items_count <= this.items_to_show;

      this.infinite_initial_margin = -this.item_width;
      if (this.items_to_show % 2 == 0) this.infinite_initial_margin += this.item_width / 2;
    },

    /**
     * Update carousel state (clases, so on)
     */
    update_state() {
      this.$element.css({ transition: `transform ${this.options.speed / 1000}s` });

      if (this.hide_controls) this.$container.addClass('hide-controls');
      else this.$container.removeClass('hide-controls');
    },

    /**
     * Set slides properties
     */
    init_slides() {
      this.$element.find('>li').each(function (i) {
        $(this).attr('data-slide', i);
      });
    },

    /**
     * Init controls
     */
    init_controls() {
      const that = this;

      // Controls
      this.$btn_left = this.$container.append('<a href="" class="vmc-arrow-left"></a>').find('.vmc-arrow-left');
      this.$btn_right = this.$container.append('<a href="" class="vmc-arrow-right"></a>').find('.vmc-arrow-right');

      // Bind controls
      this.$btn_left.click((e) => {
        e.preventDefault();
        that.slide_relative(-1);
      });
      this.$btn_right.click((e) => {
        e.preventDefault();
        that.slide_relative(1);
      });
    },

    /**
     * Reorder slider to place item at the center
     *
     * @param position
     */
    reorder_to_center(position) {
      // Dont reorder if 2 or less items
      if (this.orig_items_count < 3) return;

      // Calc shift times and direction
      let shift_count = Math.floor(this.orig_items_count / 2) - position;
      const dir = shift_count > 0 ? -1 : 1;

      // Shift items
      shift_count = Math.abs(shift_count);
      for (let i = 0; i < shift_count; i++) this.switch_slides(dir);
    },

    /**
     * Move to exact slide
     *
     * @param slide
     */
    set_slide(slide) {
      const position = this.$element.find(`>[data-slide="${slide}"]`).index();

      this.slide_relative(position);
    },

    /**
     * Slide n items forth or back
     *
     * @param offset
     */
    slide_relative(offset) {
      if (this.options.centered && this.options.infinite) this.slide_relative_centered_infinite(offset);
      else if (this.options.centered) this.slide_relative_centered(offset);
      else this.slide_relative_left(offset);
    },

    /**
     * Slide n items forth or back for left mode
     *
     * @param offset
     */
    slide_relative_left(offset) {
      let new_position = this.current_position + offset * this.items_to_slide;

      // If now is ribbon tail on go back reverse to slide_count step
      if (this.current_position == this.items_count && offset < 0) {
        new_position = (Math.floor(this.items_count / this.items_to_slide) + offset) * this.items_to_slide;

        // Show ribbon tail (last slide to right border)
      } else if (new_position < 0 || (this.items_to_slide > this.items_count - new_position && new_position < this.items_count)) {
        new_position = this.items_count - this.items_to_show;

        // Scroll to beggining
      } else if (new_position > this.items_count - this.items_to_show) {
        new_position = 0;
      }

      const margin_left = -this.item_width * new_position;

      // Animate slide
      this.animate_slide(margin_left);

      this.change_slide(new_position, new_position);
    },

    /**
     * Slide n items forth or back for centered mode
     *
     * @param offset
     */
    slide_relative_centered(offset) {
      let new_position = this.current_position + offset * this.items_to_slide;

      if (new_position < 0) {
        new_position = this.items_count - 1;

        // Scroll to beggining
      } else if (new_position >= this.items_count) {
        new_position = 0;
      }

      const margin_left = this.viewport_width / 2 - (this.item_width * (new_position + 1) - this.item_width / 2);

      // Animate slide
      this.animate_slide(margin_left);

      const new_active_slide = this.$items.eq(new_position).attr('data-slide');

      this.change_slide(new_position, new_active_slide);
    },

    /**
     * Init infinite carousel feature
     */
    init_infinite(start_item) {
      if (!this.options.infinite) return;

      this.make_clones();

      this.calc_variables();

      this.$element.css('margin-left', `${this.infinite_initial_margin}px`);
    },

    /**
     * Make clones for infinite carousel
     */
    make_clones() {
      let times = 1;
      if (this.items_count < this.items_to_show) times = Math.ceil(this.items_to_show / this.items_count);

      for (let i = 0; i < times; i++) {
        this.$element.prepend(this.$orig_items.clone().addClass('vmc-clone'));
      }

      this.$items = this.$element.find('>li');
      this.items_count = this.$items.length;
    },

    /**
     * Slide n items forth or back for centered mode with infinite mode
     *
     * @param offset
     */
    slide_relative_centered_infinite(offset) {
      const that = this;

      // Only one item to slide
      offset = offset < 0 ? -1 : 1;

      const margin_left = this.infinite_initial_margin - this.item_width * offset;

      // if(this.items_to_show % 2 == 0) margin_left += this.item_width / 2;

      const new_position = Math.ceil(this.items_to_show / 2) + offset;

      const new_active_slide = this.$items.eq(new_position).attr('data-slide');

      this.animate_slide(
        margin_left,
        (e) => {
          that.switch_slides(offset);

          that.$element.css('margin-left', `${that.infinite_initial_margin}px`);
        },
        'margin'
      );

      this.change_slide(new_position, new_active_slide);
    },

    /**
     * Place first slide at the end or last slide before first
     *
     * @param dir
     */
    switch_slides(dir) {
      const that = this;

      // Switch last or first item
      if (dir > 0) {
        that.$items.last().after(that.$items.first());
      } else {
        that.$items.first().before(that.$items.last());
      }

      // Reload elements
      that.$items = that.$element.find('>li');
    },

    /**
     * Set first active slide for infinite carousel
     *
     */
    set_active_infinite(position) {
      const center_position = Math.ceil(this.items_to_show / 2);

      for (let i = 0; i < this.orig_items_count; i++) {
        this.switch_slides(1);
        if (this.$items.eq(center_position).attr('data-slide') == position) {
          this.$items.eq(center_position).addClass('vmc_active');
          return true;
        }
      }

      return false;
    },

    /**
     * Change slide
     *
     * @param new_position
     * @param margin_left
     */
    change_slide(new_position, new_active_slide) {
      const that = this;

      // Update current position
      this.current_position = new_position;
      // Add active class
      this.$items.removeClass('vmc_active').eq(this.current_position).addClass('vmc_active');
      // Restart timer
      if (this.options.autoplay) this.start_timer();
      // Call callback
      if (typeof this.options.changed_slide === 'function') {
        this.options.changed_slide.call(this, new_active_slide);
      }
    },

    /**
     * Slide animation
     *
     * @param margin_left
     */
    animate_slide(margin_left, complete, type) {
      const that = this;

      if (type == undefined) type = 'css3';
      if (complete == undefined) complete = $.noop();

      if (Modernizr.csstransitions && type == 'css3') {
        this.$element.css('transform', `translate3d(${margin_left}px,0px,0px)`);
        this.$element.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', complete);
      } else {
        this.$element.stop(true).animate({ 'margin-left': `${margin_left}px` }, this.options.speed, 'swing', complete);
      }
    },

    /**
     * Resize event
     */
    resize() {
      this.calc_variables();

      this.update_state();

      // Update slider position
      this.slide_relative(0);
    },

    /**
     * Start timer
     */
    start_timer() {
      const that = this;
      if (this.timer_id != 0) clearTimeout(this.timer_id);
      this.timer_id = setTimeout(() => {
        that.slide_relative(1);
      }, this.options.delay);
    },

    /**
     * Stop timer
     */
    stop_timer() {
      clearTimeout(this.timer_id);
      this.timer_id = 0;
    },
  }; // Plugin.prototype

  /**
   * Attach to Jquery
   *
   * @param options
   * @returns {*}
   */
  $.fn[pluginName] = function (options) {
    const args = [].slice.call(arguments, 1);
    return this.each(function () {
      if (!$.data(this, `plugin_${pluginName}`)) {
        $.data(this, `plugin_${pluginName}`, new Plugin(this, options));
      } else if ($.isFunction(Plugin.prototype[options])) {
        $.data(this, `plugin_${pluginName}`)[options].apply($.data(this, `plugin_${pluginName}`), args);
      }
    });
  };

  // Auto init for tags with data-vmcarousel attribute
  $('[data-vmcarousel]').vmcarousel();
})(jQuery, window, document);
