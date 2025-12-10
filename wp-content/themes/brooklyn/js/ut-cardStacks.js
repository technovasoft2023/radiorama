(function($) {
    "use strict";
    var iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream,
        android = /Android/.test(navigator.userAgent) && !window.MSStream,
        prevW = Math.max( document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth ),
        prevH = Math.max( document.body.scrollHeight, document.body.offsetHeight,
            document.documentElement.clientHeight,  document.documentElement.scrollHeight,  document.documentElement.offsetHeight ),
        firstObs = true,
        isMobileUsing = false;
    if ( iPhone || (android && Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 750) ) {
        isMobileUsing = true;
    }
    const defParms = {
        el: '',
        noMobile: false,
        noTablet: false,
        scale: 80,
        opacity: 0,
        radius: 0,
        radius_unit: 'px',
        animation_x: 0,
        animation_y: 0,
        blur: 0,
        perspective: 10,
        offTop: 100,
        offBottom: 0,
        rotate: 0,
        safe: false
    }

    function parseArgs(args, defaults) {
        return Object.assign({}, defaults, args);
    }

    window.UT_CardStacks = function(el) {
        let args = parseArgs(el, defParms);
        let $scrollTrgrEl = $(args.el),
            $row = $('> .ut-stackCards-wrapper', $scrollTrgrEl),
            $row_in = $('> .ut-stackCards-winner', $row),
            cardL = $('.ut-stackCard', $scrollTrgrEl).length,
            stickyCards = cardL && true,
            animLast = false,
            stickyOpts = stickyCards ? 'data-sticky' : false,
            $animateTrgrEl = $scrollTrgrEl,
            noMobile = args.noMobile,
            noTablet = args.noTablet,
            els = '',
            sticky = null,
            noSpace = null,
            state = 'end',
            target = 'el',
            origin = 'center',
            mask = null,
            _scale = args.scale,
            stepScale = stickyCards && $scrollTrgrEl.attr('data-anim-scale-step') === 'yes',
            opacity = args.opacity,
            radius = args.radius,
            radius_unit = args.radius_unit,
            clip_path = $scrollTrgrEl.attr('data-clip-path'),
            animation_x = args.animation_x,
            animation_x_alt = null,
            animation_y = args.animation_y,
            blur = args.blur,
            perspective = args.perspective,
            rotate = args.rotate,
            rotate_alt = null,
            topBottom = null,
            offTop = args.offTop,
            offBottom = args.offBottom,
            safe = args.safe ? (window.innerHeight/100*(100-offTop)) : 0,
            animation_rows_start = 'top',
            easeOut = 'none',
            offSetCard = '0',
            stickyLast = $scrollTrgrEl.attr('data-anim-sticky-last') === 'yes' && stickyCards,
            $lastEl = $('.ut-stackCard', $scrollTrgrEl).last(),
            setTxtReveal,
            txtTrggrStart = false,
            winWidth = $(window).width(),
            mediaQuery = 959,
            mediaQueryMobile = 767,
            limit_width = '1299px',
            alreadyareaAnimateScrollTl = false;

        let parentSection = $row.parents('.vc_section');
        _scale = _scale === '' ? 0 : parseFloat( _scale );
        perspective = perspective === '' ? 0.001 : parseFloat(perspective) + 0.001;
        offTop = offTop === '' ? 0 : parseFloat( offTop );
        offBottom = offBottom === '' ? 0 : parseFloat( offBottom );
        offSetCard = offSetCard === '' ? 0 : parseFloat( offSetCard );

        function areaAnimateScrollTl($el, id, last) {
            alreadyareaAnimateScrollTl = true;

            var pTop = parseFloat( $row.css('padding-top') ),
                innerGap = pTop + offSetCard * id,
                scale = _scale;

            if ( isMobileUsing ) {
                innerGap = 0;
            }

            if ( stepScale ) {
                if ( _scale < 100 ) {
                    scale = _scale + ( ( 100 - _scale ) / (cardL) * (id) );
                }
            }

            if ( els === 'content' ) {
                $animateTrgrEl = $('> .ut-stackCard-content', $scrollTrgrEl);
            } else if ( els === 'bg' ) {
                $animateTrgrEl = $('> .ut-stackCard-bg', $scrollTrgrEl);
            } else {
                $animateTrgrEl = $el;
            }

            if ( rotate_alt === 'yes') {
                rotate *= -1;
                perspective *= -1;
            }

            if ( animation_x_alt === 'yes') {
                animation_x *= -1;
            }

            var $parentDiv = $el.closest('div[data-sticky]');

            var start_topBottom = topBottom === 'bottom' ? "bottom bottom-=" + (window.innerHeight/100*offTop) + "px" : "top top+=" + (window.innerHeight/100*offTop) + "px";

            var scrllTrggr = {
                trigger: $parentDiv,
                end: function(){
                    return ("+=" + (offBottom === 0 ? $scrollTrgrEl.outerHeight() - safe : (window.innerHeight/100*offBottom)))
                },
                start: stickyCards ? "top+=" + (offTop)+"px" : start_topBottom,
                pin: false,
                pinSpacing: ((noSpace !== "yes" && !stickyCards) || (state !== 'end' && last)) && !(stickyCards && state !== 'end' && !animLast && id === 0),
                scrub: true,
                id: 'sticky_' + id,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                // markers: {
                //     indent: 150 * id
                // },
                onToggle: function(){
                    $scrollTrgrEl.attr('data-revealed', true);
                },
            };

            if ( !stickyLast && state === 'end' ) {
                last = false;
            }

            if ( stickyCards ) {
                if ( state !== 'end' ) {
                    if ( animation_rows_start === 'center' ) {
                        scrllTrggr.start = "center center";
                        scrllTrggr.end = "bottom bottom-=" + (window.innerHeight);
                    } else if ( animation_rows_start === 'bottom' ) {
                        if ( stickyOpts !== 'no' ) {
                            scrllTrggr.start = "bottom bottom";
                            scrllTrggr.end = "bottom bottom";
                        }
                    } else {
                        scrllTrggr.end = "bottom bottom-=" + (window.innerHeight/2);
                    }
                    if ( stickyOpts === 'no' ) {
                        scrllTrggr.endTrigger = $el;
                        scrllTrggr.end = "+=100%";
                    } else {
                        scrllTrggr.endTrigger = $row;
                    }
                } else {
                    if ( animation_rows_start === 'center' ) {
                        scrllTrggr.start = "center center";
                    } else if ( animation_rows_start === 'bottom' ) {
                        scrllTrggr.start = "bottom bottom";
                    }
                    if ( stickyOpts !== 'no' ) {
                        scrllTrggr.end = "top-=" + (offBottom)+"px";
                        scrllTrggr.endTrigger = $lastEl;
                    } else {
                        scrllTrggr.end = "bottom bottom";
                    }

                }
            }

            var tl = gsap.timeline({
                scrollTrigger: scrllTrggr
            });

            // var mark = last ? {
            //         startColor:"blue",
            //         endColor:"orange",
            //     } : false;

            if ( !stickyCards ) {
                var tlConds = tl;

            } else {
                var scrllTrggrConds = {
                    trigger: $parentDiv,
                    end: function(){
                        return ("+=" + (offBottom === 0 || stickyCards ? window.innerHeight - safe : (window.innerHeight/100*offBottom)))
                    },
                    pin: true,
                    pinSpacing: false,
                    scrub: true,
                    id: 'card_' + id,
                    invalidateOnRefresh: true,
                    // markers: true,
                };
                if ( stickyCards ) {
                    if ( state !== 'end' ) {
                        if ( stickyOpts === '' ) {
                            scrllTrggrConds.end = "bottom bottom-=100%";
                            scrllTrggrConds.endTrigger = $row_in;
                        }

                        if ( animation_rows_start === 'bottom' ) {
                            if ( stickyOpts !== 'no') {
                                scrllTrggrConds.end = "bottom bottom";
                            }
                        }
                    } else {
                        if ( stickyOpts === '' ) {
                            if ( animLast ) {
                                scrllTrggrConds.end = "bottom bottom-=100%";
                            } else {
                                scrllTrggrConds.end = "bottom bottom";
                            }
                            scrllTrggrConds.endTrigger = $lastEl;
                        }

                    }

                } else {

                }
                scrllTrggrConds.start =  "top +="+parentSection.css("padding-top");
                var tlConds = gsap.timeline({
                    scrollTrigger: scrllTrggrConds
                });
            }
            if ( !(stickyCards && state !== 'end' && !animLast && id === 0) ) {
                if ( target === 'mask' ) {
                    if ( state !== 'end' ) {
                        if ( mask === 'auto' ) {
                            gsap.set(
                                $animateTrgrEl, {
                                    clipPath: 'inset(0% ' + (( winWidth - parseFloat(limit_width) )/2) + 'px round ' + radius + radius_unit + ')',
                                    opacity: parseFloat(opacity),
                                    filter: 'blur(' + blur + 'px)',
                                    visibility: 'visible',
                                }
                            )
                            tlConds.fromTo($animateTrgrEl, {
                                clipPath: 'inset(0% ' + (( winWidth - parseFloat(limit_width) )/2) + 'px round ' + radius + radius_unit + ')',
                                opacity: parseFloat(opacity),
                                filter: 'blur(' + blur + 'px)',
                                duration: 1,
                            }, {
                                opacity: 1,
                                clipPath: 'inset(0% 0px round 0' + radius_unit + ')',
                                filter: 'blur(0px)',
                                duration: 1,
                                ease: easeOut,
                                //delay: 0.1
                            });
                        } else {
                            tlConds.fromTo($animateTrgrEl, {
                                opacity: parseFloat(opacity),
                                clipPath: clip_path,
                                filter: 'blur(' + blur + 'px)',
                                duration: 1,
                            }, {
                                opacity: 1,
                                clipPath: 'inset(0% 0% 0% 0% round 0' + radius_unit + ')',
                                filter: 'blur(0px)',
                                duration: 1,
                                ease: easeOut,
                                //delay: 0.1
                            });
                        }
                    } else {
                        if ( mask === 'auto' ) {
                            tlConds.fromTo($animateTrgrEl, {
                                opacity: 1,
                                clipPath: 'inset(0% 0px round 0' + radius_unit + ')',
                                filter: 'blur(0px)',
                                duration: 1,
                            },{
                                opacity: parseFloat(opacity),
                                clipPath: 'inset(0% ' + (( winWidth - parseFloat(limit_width) )/2) + 'px round ' + radius + radius_unit + ')',
                                filter: 'blur(' + blur + 'px)',
                                ease: easeOut,
                                duration: 1,
                                //delay: 0.1
                            });
                        } else {
                            tlConds.fromTo($animateTrgrEl, {
                                opacity: 1,
                                clipPath: 'inset(0% 0% 0% 0% round 0' + radius_unit + ')',
                                filter: 'blur(0px)',
                                duration: 1,
                            },{
                                opacity: parseFloat(opacity),
                                clipPath: clip_path,
                                filter: 'blur(' + blur + 'px)',
                                duration: 1,
                                ease: easeOut,
                                //delay: 0.1
                            });
                        }
                    }
                } else {
                    if ( state !== 'end' ) {
                        if ( scale === 'auto' ) {
                            if ( radius ) {
                                gsap.set(
                                    $animateTrgrEl, {
                                        scaleX: 1 - ( ( winWidth - parseFloat(limit_width) ) /winWidth ),
                                        scaleY: 1 - ( ( winWidth - parseFloat(limit_width) ) /winWidth ),
                                        x: animation_x + 'vw',
                                        y: animation_y + 'vh',
                                        filter: 'blur(' + blur + 'px)',
                                        rotation: rotate,
                                        rotationX: rotate == 0 ? perspective : 0,
                                        transformPerspective: '100vw',
                                        opacity: parseFloat(opacity),
                                        transformOrigin: origin,
                                        borderRadius: radius + radius_unit,
                                        visibility: 'visible',
                                    }
                                )
                                tlConds.fromTo($animateTrgrEl, {
                                    scaleX: 1 - ( ( winWidth - parseFloat(limit_width) ) /winWidth ),
                                    scaleY: 1 - ( ( winWidth - parseFloat(limit_width) ) /winWidth ),
                                    x: animation_x + 'vw',
                                    y: animation_y + 'vh',
                                    filter: 'blur(' + blur + 'px)',
                                    rotation: rotate,
                                    rotationX: rotate == 0 ? perspective : 0,
                                    transformPerspective: '100vw',
                                    opacity: parseFloat(opacity),
                                    borderRadius: radius + radius_unit,
                                    transformOrigin: origin,
                                    duration: 1,
                                }, {
                                    scaleX: 1,
                                    scaleY: 1,
                                    x: 0,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    rotation: 0,
                                    rotationX: 0,
                                    opacity: 1,
                                    borderRadius: 0 + radius_unit,
                                    transformOrigin: origin,
                                    duration: 1,
                                    ease: easeOut,
                                    //delay: 0.1
                                });
                            } else {
                                gsap.set(
                                    $animateTrgrEl, {
                                        scaleX: 1 - ( ( winWidth - parseFloat(limit_width) ) /winWidth ),
                                        scaleY: 1 - ( ( winWidth - parseFloat(limit_width) ) /winWidth ),
                                        x: animation_x + 'vw',
                                        y: animation_y + 'vh',
                                        filter: 'blur(' + blur + 'px)',
                                        rotation: rotate,
                                        rotationX: rotate == 0 ? perspective : 0,
                                        transformPerspective: '100vw',
                                        opacity: parseFloat(opacity),
                                        transformOrigin: origin,
                                        visibility: 'visible',
                                    }
                                )
                                tlConds.fromTo($animateTrgrEl, {
                                    scaleX: 1 - ( ( winWidth - parseFloat(limit_width) ) /winWidth ),
                                    scaleY: 1 - ( ( winWidth - parseFloat(limit_width) ) /winWidth ),
                                    x: animation_x + 'vw',
                                    y: animation_y + 'vh',
                                    filter: 'blur(' + blur + 'px)',
                                    rotation: rotate,
                                    rotationX: rotate == 0 ? perspective : 0,
                                    transformPerspective: '100vw',
                                    opacity: parseFloat(opacity),
                                    transformOrigin: origin,
                                    duration: 1,
                                }, {
                                    scaleX: 1,
                                    scaleY: 1,
                                    x: 0,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    rotation: 0,
                                    rotationX: 0,
                                    opacity: 1,
                                    transformOrigin: origin,
                                    duration: 1,
                                    ease: easeOut,
                                    //delay: 0.1
                                });
                            }
                        } else {
                            if ( radius ) {
                                gsap.set(
                                    $animateTrgrEl, {
                                        scaleX: parseFloat( scale ) / 100,
                                        scaleY: parseFloat( scale ) / 100,
                                        opacity: parseFloat(opacity),
                                        x: animation_x + 'vw',
                                        y: animation_y + 'vh',
                                        filter: 'blur(' + blur + 'px)',
                                        rotation: rotate,
                                        rotationX: rotate == 0 ? perspective : 0,
                                        transformPerspective: '100vw',
                                        transformOrigin: origin,
                                        borderRadius: radius + radius_unit,
                                        visibility: 'visible',
                                    }
                                )
                                tlConds.fromTo($animateTrgrEl, {
                                    scaleX: parseFloat( scale ) / 100,
                                    scaleY: parseFloat( scale ) / 100,
                                    opacity: parseFloat(opacity),
                                    x: animation_x + 'vw',
                                    y: animation_y + 'vh',
                                    filter: 'blur(' + blur + 'px)',
                                    rotation: rotate,
                                    rotationX: rotate == 0 ? perspective : 0,
                                    transformPerspective: '100vw',
                                    borderRadius: radius + radius_unit,
                                    transformOrigin: origin,
                                    duration: 1,
                                }, {
                                    scaleX: 1,
                                    scaleY: 1,
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    rotation: 0,
                                    rotationX: 0,
                                    transformOrigin: origin,
                                    ease: easeOut,
                                    duration: 1,
                                    borderRadius: 0 + radius_unit,
                                    //delay: 0.1
                                });
                            } else {
                                gsap.set(
                                    $animateTrgrEl, {
                                        scaleX: parseFloat( scale ) / 100,
                                        scaleY: parseFloat( scale ) / 100,
                                        opacity: parseFloat(opacity),
                                        x: animation_x + 'vw',
                                        y: animation_y + 'vh',
                                        filter: 'blur(' + blur + 'px)',
                                        rotation: rotate,
                                        rotationX: rotate == 0 ? perspective : 0,
                                        transformPerspective: '100vw',
                                        transformOrigin: origin,
                                        visibility: 'visible',
                                    }
                                )
                                tlConds.fromTo($animateTrgrEl, {
                                    scaleX: parseFloat( scale ) / 100,
                                    scaleY: parseFloat( scale ) / 100,
                                    opacity: parseFloat(opacity),
                                    x: animation_x + 'vw',
                                    y: animation_y + 'vh',
                                    filter: 'blur(' + blur + 'px)',
                                    rotation: rotate,
                                    rotationX: rotate == 0 ? perspective : 0,
                                    transformPerspective: '100vw',
                                    transformOrigin: origin,
                                    duration: 1,
                                }, {
                                    scaleX: 1,
                                    scaleY: 1,
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    rotation: 0,
                                    rotationX: 0,
                                    transformOrigin: origin,
                                    duration: 1,
                                    ease: easeOut,
                                    //delay: 0.1
                                });
                            }
                        }
                    } else {
                        if ( scale === 'auto' ) {
                            tlConds.fromTo($animateTrgrEl, {
                                scaleX: 1,
                                scaleY: 1,
                                opacity: 1,
                                x: 0,
                                y: 0,
                                filter: 'blur(0px)',
                                rotation: 0,
                                rotationX: 0,
                                transformOrigin: origin,
                                duration: 1,
                            }, {
                                scaleX: 1 - ( ( winWidth - parseFloat(limit_width) ) /winWidth ),
                                scaleY: 1 - ( ( winWidth - parseFloat(limit_width) ) /winWidth ),
                                opacity: parseFloat(opacity),
                                x: animation_x + 'vw',
                                y: animation_y + 'vh',
                                filter: 'blur(' + blur + 'px)',
                                rotation: rotate,
                                rotationX: rotate == 0 ? perspective : 0,
                                transformPerspective: '100vw',
                                transformOrigin: origin,
                                duration: 1,
                                ease: easeOut,
                                //delay: 0.1
                            })
                        } else {
                            tlConds.fromTo($animateTrgrEl, {
                                scaleX: 1,
                                scaleY: 1,
                                opacity: 1,
                                x: 0,
                                y: 0,
                                filter: 'blur(0px)',
                                rotation: 0,
                                rotationX: 0,
                                transformPerspective: '100vw',
                                transformOrigin: origin,
                                borderRadius: 0 + radius_unit,
                                duration: 1,
                            }, {
                                scaleX: parseFloat( scale ) / 100,
                                scaleY: parseFloat( scale ) / 100,
                                opacity: parseFloat(opacity),
                                x: animation_x + 'vw',
                                y: animation_y + 'vh',
                                filter: 'blur(' + blur + 'px)',
                                rotation: rotate,
                                rotationX: rotate == 0 ? perspective : 0,
                                transformPerspective: '100vw',
                                transformOrigin: origin,
                                borderRadius: radius + radius_unit,
                                duration: 1,
                                ease: easeOut,
                                //delay: 0.1
                            })
                        }
                    }
                }
            }


            var _height = Math.max( document.body.scrollHeight, document.body.offsetHeight,
                document.documentElement.clientHeight,  document.documentElement.scrollHeight,  document.documentElement.offsetHeight );
            var _width = Math.max( document.body.scrollWidth, document.body.offsetWidth,
                document.documentElement.clientWidth,  document.documentElement.scrollWidth,  document.documentElement.offsetWidth );


            $(window).on('load ', function(e){
                var ___height = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
                if ( _height !== ___height ) {
                    $scrollTrgrEl.attr('data-toggled', true);
                    $(window).trigger('resize');
                    if ( typeof tl !== 'undefined' ) {
                        tl.scrollTrigger.refresh();
                    }
                    if ( typeof tlConds !== 'undefined' ) {
                        tlConds.scrollTrigger.refresh();
                    }
                    _height = ___height;
                }

                $(document).trigger('ut-scrolltrigger-refresh');

            });
            $(document).on('vc-full-width-row', function () {
                if ( typeof tl !== 'undefined' ) {
                    tl.scrollTrigger.refresh();
                }
                if ( typeof tlConds !== 'undefined' ) {
                    tlConds.scrollTrigger.refresh();
                }
            })
        };

        var callAreaAnimateScrollTl = function() {
            if ( stickyCards ) {
                $('.ut-stackCard', $scrollTrgrEl).each(function(key, val){
                    if ( key+1 < cardL || animLast || state !== 'end' ) {
                        var $this = $(val),
                            last = key+1===cardL;
                        areaAnimateScrollTl($this, key, last);
                    }
                });
            } else {
                areaAnimateScrollTl($scrollTrgrEl, 0, false);
            }
        };

        $(window).on('wwResize', function(){
            if ( !alreadyareaAnimateScrollTl ) {
                if ( noMobile ) {
                    if ( noTablet && winWidth <= mediaQuery ) {
                        return;
                    } else if ( winWidth <= mediaQueryMobile ) {
                        return;
                    }
                }

                callAreaAnimateScrollTl();
            }
        })

        if ( noMobile ) {
            if ( noTablet && winWidth <= mediaQuery ) {
                return;
            } else if ( winWidth <= mediaQueryMobile ) {
                return;
            }
        }

        callAreaAnimateScrollTl();

    };

    $(document).trigger('ut-cardStack-loaded');
})(jQuery);