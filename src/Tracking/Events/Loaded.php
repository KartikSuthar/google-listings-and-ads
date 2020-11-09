<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\GoogleForWC\Tracking\Events;

use Automattic\WooCommerce\GoogleForWC\PluginHelper;

/**
 * This class adds actions to track when the extension is loaded.
 *
 * DEMO CLASS
 *
 * @package Automattic\WooCommerce\GoogleForWC\Tracking
 */
class Loaded implements TracksEventInterface {

	use EventHelper, PluginHelper;

	/**
	 * Register the tracking class.
	 */
	public function register(): void {
		add_action( 'woogle_extension_loaded', [ $this, 'track_loaded' ] );
	}

	/**
	 * Track when the extension is first installed.
	 */
	public function track_loaded() {
		$this->record_event( 'extension_loaded', [ 'version' => $this->get_version() ] );
	}
}
