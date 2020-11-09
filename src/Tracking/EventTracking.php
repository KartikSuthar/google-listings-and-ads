<?php
declare( strict_types=1 );

namespace Automattic\WooCommerce\GoogleForWC\Tracking;

use Automattic\WooCommerce\GoogleForWC\Infrastructure\Conditional;
use Automattic\WooCommerce\GoogleForWC\Infrastructure\Registerable;
use Automattic\WooCommerce\GoogleForWC\Infrastructure\Service;
use Automattic\WooCommerce\GoogleForWC\Tracking\Events\TracksEventInterface;
use WC_Site_Tracking;

/**
 * Include Google Listings and Ads data in the WC Tracker snapshot.
 *
 * @package Automattic\WooCommerce\GoogleForWC\Tracking
 */
class EventTracking implements Service, Registerable {
	/**
	 * The tracks object.
	 *
	 * @var TracksInterface
	 */
	private static $tracks;

	/**
	 * @var string[] Individual events classes to laod
	 */
	protected $events = [
		Events\Loaded::class,
	];

	/**
	 * Hook extension tracker data into the WC tracker data.
	 */
	public function register(): void {
		add_action(
			'admin_init',
			[ $this, 'register_events' ]
		);
	}

	/**
	 *
	 */
	public function register_events() {

		$this->maybe_initialize_tracks();

		// Instantiate each event class.
		foreach ( $this->events as $class ) {
//			self::validate_class( $class, Event_Tracker_Interface::class );

			/** @var TracksEventInterface $instance */
			$instance = new $class();
			$instance->register();
			$instance->set_tracks( self::$tracks );
		}
	}

	/**
	 * Initialize the tracks object if needed.
	 */
	private function maybe_initialize_tracks() {
		if ( null === self::$tracks ) {
			self::$tracks = new Tracks();
		}
	}

}
