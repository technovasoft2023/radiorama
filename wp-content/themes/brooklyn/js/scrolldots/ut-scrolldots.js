(function($){

    "use strict";

    $(document).ready(function(){

        let $scroll_dots = $('<div></div>');

        $scroll_dots.attr('id', 'ut-scroll-dots');
        $scroll_dots.attr('class', 'ut-scroll-dots-light');
        $scroll_dots.appendTo( $('body') );

        $('section', '#main-content').each(function() {

            let $this = $(this);

            if( $this.data("hide-from-dots") ) {

                return true;

            }

            let $dot  = $('<div></div>');

            // Section ID
            if( $('.ut-vc-offset-anchor-top', $this ).length ) {

                $dot.data('section', '#' + $('.ut-vc-offset-anchor-top', $this ).attr('id') );
                $dot.attr('data-section', '#' + $('.ut-vc-offset-anchor-top', $this ).attr('id') );

            } else {

                $dot.data('section', '#' + $this.attr('id') );
                $dot.attr('data-section', '#' + $this.attr('id') );

            }

            // has title
            if( $this.data('section-title') ) {

                $dot.html('<span>' + $this.data('section-title') + '</span>');

            }

            $dot.appendTo( $scroll_dots );

        });

        $(document).on("click" , '#ut-scroll-dots > div' , function() {

            window.UT_Scroll.scroll_to( $(this).data('section'), -site_settings.brooklyn_header_scroll_offset );

        });


    });

})(jQuery);