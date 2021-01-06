<?php
declare( strict_types=1 );

namespace Automattic\WooCommerce\GoogleListingsAndAds\Exception;

use LogicException;

defined( 'ABSPATH' ) || exit;

/**
 * Class InvalidValue
 *
 * @package Automattic\WooCommerce\GoogleListingsAndAds\Exception
 */
class InvalidValue extends LogicException implements GoogleListingsAndAdsException {

	/**
	 * Create a new instance of the exception when a value is not a positive integer.
	 *
	 * @param string $method The method that requires a positive integer.
	 *
	 * @return static
	 */
	public static function negative_integer( string $method ) {
		return new static( sprintf( 'The method "%s" requires a positive integer value.', $method ) );
	}

	/**
	 * Create a new instance of the exception when a value is not instance of a given class.
	 *
	 * @param string $class_name The name of the class that the value must be an instance of.
	 * @param string $key        The name of the value.
	 *
	 * @return static
	 */
	public static function not_instance_of( string $class_name, string $key ) {
		return new static( sprintf( 'The value of %s must be an instance of %s.', $key, $class_name ) );
	}
}
