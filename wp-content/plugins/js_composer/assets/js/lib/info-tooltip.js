(function ($) {
    $.fn.initializeTooltips = function ( boundary ) {
        this.each(function () {
            var element = this;
            var tooltipEl = $(this).next('.tooltip-content')[0];

            var hideTimeout;
            function show() {
                clearTimeout(hideTimeout);
                element.setAttribute('data-show', '');
                popperInstance.update();
            }

            function hide() {
                hideTimeout = setTimeout(function () {
                    element.removeAttribute('data-show');
                }, 500);
            }

            var showEvents = ['mouseenter', 'focus'];
            var hideEvents = ['mouseleave', 'blur'];

            showEvents.forEach(function (event) {
                element.addEventListener(event, show);
                tooltipEl.addEventListener(event, show);
            });

            hideEvents.forEach(function (event) {
                element.addEventListener(event, hide);
                tooltipEl.addEventListener(event, hide);
            });

            if (!boundary) {
                boundary = '.vc_shortcode-param';
            }

            var popperInstance = Popper.createPopper(element, tooltipEl, {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [10, 5],
                        },
                    },
                    {
                        name: 'preventOverflow',
                        options: {
                            boundary: element.closest(boundary),
                            altAxis: true,
                            tether: false,
                            rootBoundary: 'document',
                        },
                    },
                ],
            });
        });
        return this; // Maintain jQuery chaining
    };
})(jQuery);