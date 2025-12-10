(function($){

    "use strict";

    window.ut_images = {
        page: 1,
        processed: 0,
        total_images: 0,
        recursion: function() {
            const that = this;
            $.ajax( {
                url: UT_IMAGES.url,
                method: "POST",
                data: {
                    nonce: UT_IMAGES.nonce,
                    paged: that.page,
                    action: 'ut_clean_processed_images'
                }
            } ).done( function (resp) {
                that.page++;
                that.processed += 10;
                that.process_batch();
                if( that.processed <= that.total_images && resp === '1' ) {
                    that.recursion();
                }
            } )
        },
        start_cleaning: function () {
            const that = this;
            $('.clean-button').prop( 'disabled', true);
            $('.ut-img-progress').html('<div class="progress-bar" id="progress-bar"></div>');
            $('.progress-bar').css('width', '10%');
            $.ajax( {
                url: UT_IMAGES.url,
                method: "POST",
                data: {
                    nonce: UT_IMAGES.nonce,
                    action: 'ut_count_attachments'
                }
            } ).done( function (resp) {
                if( resp >= 1 ) {
                    that.total_images = resp;
                    that.recursion();
                }
            } )
        },
        process_batch: function () {
            const progressBar = document.getElementById('progress-bar');
            if (this.processed < this.total_images) {
                const progressPercentage = (this.processed / this.total_images) * 100;
                progressBar.style.width = progressPercentage + '%';
                progressBar.textContent = Math.round(progressPercentage) + '%';
            } else {
                progressBar.style.width = '100%';
                progressBar.textContent = '100%';
                $('.popup-body').append('<p class="img-note">All generated images has been removed, New image will be generated on the background, If you want to manually start the generate action install Cron Manager plugin and run "wp_queue_connections_databaseconnection" event </p>');
            }
        },
        init: function () {
            const that = this;
            const popup = new Popup({
                id: "ut-popup",
                title: "Clean Processed Images",
                content: `
                This action will remove all the generated image sizes but will keep the original size, Do you want to continue ?
                 {ut-img-progress}[]
                {btn-clean-button button}[Yes]
                `,
                loadCallback: () => {
                    const button = document.querySelector(".clean-button");
                    button.addEventListener("click", () => {
                        that.start_cleaning();
                    });
                },
                hideCallback: () => {
                    $('.ut-img-progress').remove();
                    $('.img-note').remove();
                    $('.clean-button').prop( 'disabled', false);
                },
                css: `
                    .popup-header {
                        justify-content: start;
                        margin: 15px 0;
                        border-bottom: 1px solid #efefef;
                        padding-bottom: 15px;
                    }
                    .popup-title {
                        margin: 0 15px;
                        font-size: 16px;
                    }
                    .popup-close {
                        margin-top: 10px;
                    }
                    .popup-body {
                       text-align: left;
                    }
                    .progress-container {
                        width: 100%;
                        background-color: #f3f3f3;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        overflow: hidden;
                        margin: 20px 0;
                    }
                    
                    .progress-bar {
                        width: 0;
                        height: 30px;
                        background-color: #4caf50;
                        text-align: center;
                        color: white;
                        line-height: 30px; /* Center the text vertically */
                    }
                `
            });
            $('#ut-clean-images').on( 'click', function (e) {
                e.preventDefault();
                popup.show();
            } )
        }
    }

    ut_images.init();

})(jQuery);