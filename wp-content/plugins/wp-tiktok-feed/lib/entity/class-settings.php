<?php
namespace QuadLayers\TTF\Entity;

use QuadLayers\WP_Orm\Entity\SingleEntity;

class Settings extends SingleEntity {
	public $flush             = false;
	public $spinner_image_url = '';
}
