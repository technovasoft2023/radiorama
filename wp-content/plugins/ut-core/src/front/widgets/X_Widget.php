<?php

namespace UTCore\front\widgets;
use Abraham\TwitterOAuth\TwitterOAuth;
use Noweh\TwitterApi\Client;

class X_Widget extends \WP_Widget {

    protected $slug = 'ut_x';

    function __construct() {
        $widget_ops = array('classname' => 'ut_widget_x', 'description' => __( 'Displays simple X tweets', 'ut_lang') );
        parent::__construct('lw_ut_x', __('United Themes - X', 'ut_lang'), $widget_ops);
        $this->alt_option_name = 'ut_widget_twitter';

    }

    function form($instance) {

        if ( $instance ) {

            $title = esc_attr( $instance['title'] );

            $twitter_count = esc_attr($instance['count']);
            $twitter_count = is_int($twitter_count) && (!$twitter_count) ? "5" : $twitter_count;

        } ?>

        <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Title:', 'ut_lang'); ?>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo isset($title) ? $title : ''; ?>" />
        </label>
        <p class="description"><?php _e('The widgets title.', 'ut_lang' ); ?></p>

        <label for="<?php echo $this->get_field_id('count'); ?>"><?php _e('Count:', 'ut_lang'); ?>
            <input class="widefat" id="<?php echo $this->get_field_id('count'); ?>" name="<?php echo $this->get_field_name('count'); ?>" type="text" value="<?php echo isset($twitter_count) ? $twitter_count : ''; ?>" />
        </label>
        <p class="description"><?php _e('How many tweets to display.', 'ut_lang' ); ?></p>

        <?php
    }

    function update($new_instance, $old_instance) {
        return $new_instance;
    }

    function widget( $args, $instance ) {

        $twitter_options = ( is_array( get_option('ut_twitter_options') ) ) ? get_option('ut_twitter_options') : array();
        extract( $args ); extract( $instance );

        $title = apply_filters( $this->slug, $title );

        if(empty($count) ) {
            $count = 3;
        }

        /* Set access tokens here - see: https://dev.twitter.com/apps/ */
        if( empty($twitter_options['oauth_access_token']) || empty($twitter_options['oauth_access_token_secret']) || empty($twitter_options['consumer_key']) || empty($twitter_options['consumer_secret'] || empty($twitter_options['bearer_token'])) ) {

            _e( 'Please make sure you have entered all necessary Twitter API Keys under Dashboard -> Settings -> Twitter' , 'ut_lang');

        } else {

            $settings = array(
                'account_id'    => '',
                'access_token' => $twitter_options['oauth_access_token'],
                'access_token_secret' => $twitter_options['oauth_access_token_secret'],
                'consumer_key' => $twitter_options['consumer_key'],
                'consumer_secret' => $twitter_options['consumer_secret'],
                'bearer_token'  => $twitter_options['bearer_token']
            );

            $user = get_transient('ut_x_user');
            try {
                $client = new Client($settings);
                if( !$user ) {
                    $user = $client->userMeLookup()->performRequest();
                    set_transient( 'ut_x_user', $user, DAY_IN_SECONDS  );
                }
            } catch (\Exception $exception) {}



            if( empty($user) ) {

                echo '<div class="ut-alert themecolor">'.__('An Error has occured, no Twitter user is available','ut_lang').'</div>';

            } else {

                /* fallback */
                $title = (isset($title)) ? $before_title.do_shortcode($title).$after_title  : '';
                $avatar = str_replace( '_normal', '', $user->data->profile_image_url );
                /* output */
                echo $before_widget;
                echo $title; ?>
                <div class="ut-x-box">
                    <header>
                        <div class="bio">
                            <div class="avatarcontainer">
                                <a href="https://twitter.com/<?php echo esc_html( $user->data->username ) ?>" target="_blank">
                                    <img src="<?php echo esc_url( $avatar ) ?>" alt="avatar" class="avatar">
                                </a>
                            </div>
                            <div class="desc">
                            <a href="https://twitter.com/<?php echo esc_html( $user->data->username ) ?>" target="_blank">
                                <h3>@<?php echo esc_html( $user->data->username ) ?></h3>
                                <?php if( ! empty( $user->data->description ) ): ?>
                                    <p><?php echo esc_html( $user->data->description ) ?></p>
                                <?php endif; ?>
                            </a>
                            </div>

                        </div>
                    </header>
                    <div class="content">
                        <div class="data">
                            <ul>
                                <li>
                                    <?php echo esc_html( $user->data->public_metrics->tweet_count ) ?>
                                    <span><?php esc_html_e( 'Tweets', 'ut-core' ); ?></span>
                                </li>
                                <li>
                                    <?php echo esc_html( $user->data->public_metrics->followers_count ) ?>
                                    <span><?php esc_html_e( 'Followers', 'ut-core' ); ?></span>
                                </li>
                                <li>
                                    <?php echo esc_html( $user->data->public_metrics->following_count ) ?>
                                    <span><?php esc_html_e( 'Following', 'ut-core' ); ?></span>
                                </li>
                            </ul>
                        </div>
                        <div class="follow">
                            <a style="color: #fff !important;" class="twitter-follow-button" href="https://twitter.com/intent/follow?original_referer=&region=follow_link&screen_name=<?php echo esc_html( $user->data->username ) ?>" target="_blank">
                                <i class="fab fa-x-twitter"></i> <?php esc_html_e( 'Follow', 'ut-core' ); ?>
                            </a>
                        </div>
                    </div>
                </div>

                <?php /* end tweets */

                echo $after_widget;

            }

        }

    }

}