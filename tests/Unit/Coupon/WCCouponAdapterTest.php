<?php
declare( strict_types=1 );

namespace Automattic\WooCommerce\GoogleListingsAndAds\Tests\Unit\Coupon;

use Automattic\WooCommerce\GoogleListingsAndAds\Coupon\WCCouponAdapter;
use Automattic\WooCommerce\GoogleListingsAndAds\Exception\InvalidValue;
use Automattic\WooCommerce\GoogleListingsAndAds\PluginHelper;
use Automattic\WooCommerce\GoogleListingsAndAds\Tests\Framework\UnitTest;
use Automattic\WooCommerce\GoogleListingsAndAds\Tests\Tools\HelperTrait\DataTrait;
use Automattic\WooCommerce\GoogleListingsAndAds\Tests\Tools\HelperTrait\CouponTrait;
use Symfony\Component\Validator\Mapping\ClassMetadata;
use WC_DateTime;
use WC_Coupon;

/**
 * Class WCProductAdapterTest
 *
 * @package Automattic\WooCommerce\GoogleListingsAndAds\Tests\Unit\Coupon
 */
class WCCouponAdapterTest extends UnitTest {
	use CouponTrait;
	use PluginHelper;
	use DataTrait;

	public function test_throws_exception_if_wc_coupon_not_provided() {
		$this->expectException( InvalidValue::class );
		new WCCouponAdapter( [ 'targetCountry' => 'US' ] );
	}

	public function test_throws_exception_if_invalid_wc_coupon_provided() {
		$this->expectException( InvalidValue::class );
		new WCCouponAdapter(
			[
				'wc_couopon'    => new \stdClass(),
				'targetCountry' => 'US',
			]
		);
	}

	public function test_channel_is_always_set_to_online() {
		$adapted_coupon = new WCCouponAdapter(
			[
			    'wc_coupon'     => $this->create_ready_to_sync_coupon(),
				'targetCountry' => 'US',
				'channel'       => 'local',
			]
		);

		$this->assertEquals( 'ONLINE', $adapted_coupon->getRedemptionChannel() );
	}

	public function test_content_language_is_set_by_default_to_en() {
		add_filter( 'locale', function () {
			return null;
		} );

		$adapted_coupon = new WCCouponAdapter(
			[
			    'wc_coupon'     => $this->create_ready_to_sync_coupon(),
				'targetCountry' => 'US',
			]
		);

		$this->assertEquals( 'en', $adapted_coupon->getContentLanguage() );
	}

	public function test_content_language_is_set_to_wp_locale() {
		add_filter( 'locale', function () {
			return 'fr_BE';
		} );

		$adapted_coupon = new WCCouponAdapter(
			[
			    'wc_coupon'     => $this->create_ready_to_sync_coupon(),
				'targetCountry' => 'US',
			]
		);

		$this->assertEquals( 'fr', $adapted_coupon->getContentLanguage() );
	}

	public function test_promotion_id_is_set() {
	    $coupon = $this->create_ready_to_sync_coupon();
		$adapted_coupon = new WCCouponAdapter(
			[
			    'wc_coupon'     => $coupon,
				'targetCountry' => 'US',
			]
		);
		$this->assertEquals( "{$this->get_slug()}_{$coupon->get_id()}", $adapted_coupon->getPromotionId() );
	}

	public function test_coupn_code_and_amount_are_set() {
	    $coupon = $this->create_ready_to_sync_coupon();
	    $adapted_coupon = new WCCouponAdapter(
	        [
	            'wc_coupon'     => $coupon,
	            'targetCountry' => 'US',
	        ]
	    );
	    $this->assertEquals( $coupon->get_code(), $adapted_coupon->getGenericRedemptionCode() );
	    $this->assertEquals( $coupon->get_amount(), $adapted_coupon->getPercentOff() );
	    $this->assertEquals( 'GENERIC_CODE', $adapted_coupon->getOfferType() );
	    $this->assertEquals( 'PERCENT_OFF', $adapted_coupon->getCouponValueType() );
	}

	public function test_coupn_effective_dates_are_set() {
	    $coupon = $this->create_ready_to_sync_coupon();
	    $postdate = '2021-01-01T02:03:45';
	    $post_args = array(
	        'ID' => $coupon->get_id(),
	        'post_date' => $postdate,
	        'post_date_gmt' => $postdate,
	    );
	    wp_update_post( $post_args);
	    
	    $adapted_coupon = new WCCouponAdapter(
	        [
	            'wc_coupon'     => $coupon,
	            'targetCountry' => 'US',
	        ]
	        );
	    $this->assertEquals( '2021-01-01T02:03:45+00:00/2021-07-03T02:03:45+00:00', $adapted_coupon->getPromotionEffectiveDates() );
	}
	
	public function test_load_validator_metadata() {
		$metadata = new ClassMetadata( WCCouponAdapter::class );
		WCCouponAdapter::load_validator_metadata( $metadata );
		$this->assertTrue( $metadata->hasPropertyMetadata( 'targetCountry' ) );
		$this->assertTrue( $metadata->hasPropertyMetadata( 'genericRedemptionCode' ) );
		$this->assertTrue( $metadata->hasPropertyMetadata( 'promotionId' ) );
		$this->assertTrue( $metadata->hasPropertyMetadata( 'productApplicability' ) );
		$this->assertTrue( $metadata->hasPropertyMetadata( 'offerType' ) );
		$this->assertTrue( $metadata->hasPropertyMetadata( 'promotionEffectiveDates' ) );
		$this->assertTrue( $metadata->hasPropertyMetadata( 'redemptionChannel' ) );
		$this->assertTrue( $metadata->hasPropertyMetadata( 'couponValueType' ) );
	}

	public function setUp() {
		parent::setUp();
		update_option( 'woocommerce_currency', 'USD' );
	}
}
