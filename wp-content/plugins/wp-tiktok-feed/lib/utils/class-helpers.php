<?php

namespace QuadLayers\TTF\Utils;

/**
 * Helpers Class
 */
class Helpers {

	/**
	 * Function to get access token link
	 *
	 * @return string
	 */
	public static function get_access_token_link() {
		$redirect_url = QLTTF_ACCOUNT_URL;
		$url          = "https://tiktokfeedv2.quadlayers.com/auth/?redirect_url={$redirect_url}";
		return $url;
	}

	public static function get_sanitized_username( $username ) {
		// Removing @, # and trimming input
		// ---------------------------------------------------------------------

		$username = sanitize_text_field( $username );

		$username = trim( $username );
		$username = str_replace( '@', '', $username );
		$username = str_replace( '#', '', $username );
		$username = str_replace( QLTTF_TIKTOK_URL, '', $username );
		$username = str_replace( '/explore/tags/', '', $username );
		$username = str_replace( '/', '', $username );

		return $username;
	}
}
