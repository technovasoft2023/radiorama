<div class="wrap ut-twitter-wrap">

    <div id="poststuff">

        <?php echo "<h2>" . __( 'United Themes - X Settings' , 'ut-core' ) . "</h2>"; ?>

        <div id="ut-twitter-manager" class="postbox">

            <form method="post" action="options.php">

                <?php wp_nonce_field('update-options'); ?>
                <?php settings_fields('ut_twitter_options_group'); ?>

                <?php $twitter_options = ( is_array( get_option('ut_twitter_options') ) ) ? get_option('ut_twitter_options') : array(); ?>

                <h3 class="hndle"><span><?php _e("United Themes - X Settings (OAuth)" , 'ut-core' ); echo ' v' . UT_CORE_VERSION; ?></span></h3>

                <div class="inside">

                    <p>Please go to <a href="https://dev.twitter.com/apps">X Developer Apps</a> and create a new APP for your Website. Make sure that Request Type has been set to "GET" inside the "OAuth Tool" tab. Learn more about the new Twitter API here <a href="https://dev.twitter.com/docs/auth/oauth/faq">OAuth FAQ</a> and here <a href="https://dev.twitter.com/">X Developer</a>.</p>

                    <table class="form-table">
                        <tbody>

                        <tr valign="top">
                            <th scope="row"><label for="ut_twitter_options[consumer_key]"><?php _e("API Key: " , 'ut-core' ); ?></label></th>
                            <td>
                                <input class="regular-text code" type="text" name="ut_twitter_options[consumer_key]" value="<?php echo (isset($twitter_options['consumer_key'])) ? $twitter_options['consumer_key'] : '' ; ?>">
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row"><label for="ut_twitter_options[consumer_secret]"><?php _e("API Key Secret: " , 'ut-core' ); ?></label></th>
                            <td>
                                <input class="regular-text code" type="password" name="ut_twitter_options[consumer_secret]" value="<?php echo (isset($twitter_options['consumer_secret'])) ? $twitter_options['consumer_secret'] : '' ; ?>">
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row"><label for="ut_twitter_options[oauth_access_token]"><?php _e("Access Token: " , 'ut-core' ); ?></label></th>
                            <td>
                                <input class="regular-text code" type="text" name="ut_twitter_options[oauth_access_token]" value="<?php echo (isset($twitter_options['oauth_access_token'])) ? esc_attr($twitter_options['oauth_access_token']) : '' ; ?>">
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row"><label for="ut_twitter_options[oauth_access_token_secret]"><?php _e("Access Token Secret: " , 'ut-core' ); ?></label></th>
                            <td>
                                <input class="regular-text code" type="password" name="ut_twitter_options[oauth_access_token_secret]" value="<?php echo (isset($twitter_options['oauth_access_token_secret'])) ? esc_attr($twitter_options['oauth_access_token_secret']) : '' ; ?>">
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row"><label for="ut_twitter_options[bearer_token]"><?php _e("Bearer Token: " , 'ut-core' ); ?></label></th>
                            <td>
                                <input class="regular-text code" type="text" name="ut_twitter_options[bearer_token]" value="<?php echo (isset($twitter_options['oauth_access_token_secret'])) ? esc_attr($twitter_options['bearer_token']) : '' ; ?>">
                            </td>
                        </tr>

                        </tbody>
                    </table>

                    <input type="hidden" name="action" value="update" />
                    <input type="hidden" name="page_options" value="ut_twitter_options" />
                    <p class="submit"><input id="submit" type="submit" class="button button-primary" value="<?php _e('Save Changes', 'ut-core') ?>" /></p>


            </form>

        </div> <!-- end #ut-twitter-manager -->

    </div> <!-- end #poststuff -->

</div><!-- end #wrap -->