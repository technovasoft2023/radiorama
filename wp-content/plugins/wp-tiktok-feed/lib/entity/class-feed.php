<?php
namespace QuadLayers\TTF\Entity;

use QuadLayers\WP_Orm\Entity\CollectionEntity;

class Feed extends CollectionEntity {
	public static $primaryKey  = 'id'; //phpcs:ignore
	public $id                 = 0;
	public $source             = 'account';
	public $open_id            = '';
	public $region             = 'US';
	public $hashtag            = 'WordPress';
	public $username           = 'tiktok';
	public $create_time        = 0;
	public $layout             = 'masonry';
	public $limit              = 12;
	public $columns            = 3;
	public $hide_carousel_feed = true;
	public $lazy               = true;
	public $profile            = array(
		'display'   => false,
		'username'  => '',
		'nickname'  => '',
		'biography' => '',
		'link_text' => 'Follow',
		'avatar'    => '',
	);
	public $video              = array(
		'spacing' => 10,
		'radius'  => 0,
	);
	public $highlight          = array(
		'id'       => '',
		'tag'      => '',
		'position' => '1, 5, 7',
	);
	public $mask               = array(
		'display'        => true,
		'background'     => '#000000',
		'likes_count'    => true,
		'comments_count' => true,
	);
	public $box                = array(
		'display'    => false,
		'padding'    => 1,
		'radius'     => 0,
		'background' => '#fefefe',
		'text_color' => '#000000',
	);
	public $card               = array(
		'display'           => false,
		'radius'            => 0,
		'font_size'         => '12',
		'background'        => '#ffffff',
		'background_hover'  => '#ffffff',
		'text_color'        => '#000000',
		'padding'           => '5',
		'likes_count'       => true,
		'max_word_count'    => 10,
		'video_description' => true,
		'comments_count'    => true,
		'text_align'        => 'left',
	);
	public $carousel           = array(
		// 'slidespv'          => 5,
		'autoplay'          => false,
		'autoplay_interval' => 3000,
		'navarrows'         => true,
		'navarrows_color'   => '',
		'pagination'        => true,
		'pagination_color'  => '',
		// 'hoverpause'        => true,
		// 'infinite'          => true,
		// 'adaptiveheight'    => false,
		// 'rtl'               => false,
	);
	public $modal       = array(
		'display'           => true,
		'profile'           => true,
		'download'          => false,
		'video_description' => true,
		'likes_count'       => true,
		'autoplay'          => true,
		'comments_count'    => true,
		'date'              => true,
		'controls'          => true,
		'align'             => 'right',
	);
	public $button      = array(
		'display'          => true,
		'text'             => 'View on TikTok',
		'text_color'       => '#ffff',
		'background'       => '',
		'background_hover' => '',
	);
	public $button_load = array(
		'display'          => false,
		'text_color'       => '#ffff',
		'text'             => 'Load more...',
		'background'       => '',
		'background_hover' => '',
		'profile'          => '',
	);
}
