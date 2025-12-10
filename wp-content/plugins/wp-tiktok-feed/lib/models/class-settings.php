<?php
namespace QuadLayers\TTF\Models;

use QuadLayers\WP_Orm\Builder\SingleRepositoryBuilder;

class Settings {

	protected static $instance;
	protected $repository;

	public function __construct() {

		$builder = ( new SingleRepositoryBuilder() )
		->setTable( 'tiktok_feed_settings' )
		->setEntity( 'QuadLayers\TTF\Entity\Settings' );

		$this->repository = $builder->getRepository();
	}

	public function get_table() {
		return $this->repository->getTable();
	}

	public function get() {
		$entity = $this->repository->find();
		if ( $entity ) {
			return $entity->getProperties();
		}
	}

	public function delete_all() {
		return $this->repository->delete();
	}

	public function save( $data ) {
		$entity = $this->repository->create( $data );
		if ( $entity ) {
			return true;
		}
	}

	public static function instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}
