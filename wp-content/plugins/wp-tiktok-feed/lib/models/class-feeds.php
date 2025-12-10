<?php

namespace QuadLayers\TTF\Models;

use QuadLayers\TTF\Utils\Helpers;
use QuadLayers\WP_Orm\Builder\CollectionRepositoryBuilder;

/**
 * Models_Feed Class
 */
class Feeds {

	protected static $instance;
	protected $repository;

	public function __construct() {

		$builder = ( new CollectionRepositoryBuilder() )
		->setTable( 'tiktok_feed_feeds' )
		->setEntity( 'QuadLayers\TTF\Entity\Feed' )
		->setAutoIncrement( true );

		$this->repository = $builder->getRepository();
	}

	public function get_table() {
		return $this->repository->getTable();
	}

	public function get_args() {
		$entity   = new \QuadLayers\TTF\Entity\Feed();
		$defaults = $entity->getDefaults();
		return $defaults;
	}

	public function get( int $id ) {
		$entity = $this->repository->find( $id );
		if ( $entity ) {
			return $entity->getProperties();
		}
	}

	public function delete( int $id ) {
		return $this->repository->delete( $id );
	}

	public function update( int $id, array $feed ) {
		$entity = $this->repository->update( $id, $feed );
		if ( $entity ) {
			return $entity->getProperties();
		}
	}

	public function create( array $feed ) {
		if ( isset( $feed['id'] ) ) {
			unset( $feed['id'] );
		}
		if ( isset( $feed['hashtag'] ) ) {
			$feed['hashtag'] = Helpers::get_sanitized_username( $feed['hashtag'] );
		}
		if ( isset( $feed['username'] ) ) {
			$feed['username'] = Helpers::get_sanitized_username( $feed['username'] );
		}
		$entity = $this->repository->create( $feed );
		if ( $entity ) {
			return $entity->getProperties();
		}
	}

	public function get_all() {
		$entities = $this->repository->findAll();
		if ( ! $entities ) {
			return;
		}
		$feeds = array();
		foreach ( $entities as $entity ) {
			$feeds[] = $entity->getProperties();
		}
		return $feeds;
	}

	public function delete_all() {
		return $this->repository->deleteAll();
	}

	public static function instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}
