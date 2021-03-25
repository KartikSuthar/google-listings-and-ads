<?php
declare( strict_types=1 );

namespace Automattic\WooCommerce\GoogleListingsAndAds\API\Google;

use Automattic\WooCommerce\GoogleListingsAndAds\Google\Ads\GoogleAdsClient;
use Automattic\WooCommerce\GoogleListingsAndAds\Options\OptionsAwareInterface;
use Automattic\WooCommerce\GoogleListingsAndAds\Options\OptionsAwareTrait;
use Automattic\WooCommerce\GoogleListingsAndAds\Value\PositiveInteger;
use Google\Ads\GoogleAds\Util\FieldMasks;
use Google\Ads\GoogleAds\V6\Enums\MerchantCenterLinkStatusEnum\MerchantCenterLinkStatus;
use Google\Ads\GoogleAds\V6\Resources\MerchantCenterLink;
use Google\Ads\GoogleAds\V6\Services\MerchantCenterLinkOperation;
use Google\ApiCore\ApiException;
use Exception;
use Google\ApiCore\ValidationException;

defined( 'ABSPATH' ) || exit;

/**
 * Class Ads
 *
 * @package Automattic\WooCommerce\GoogleListingsAndAds\API\Google
 */
class Ads implements OptionsAwareInterface {

	use OptionsAwareTrait;
	use ApiExceptionTrait;
	use AdsQueryTrait;
	use AdsIdTrait;

	/**
	 * The Google Ads Client.
	 *
	 * @var GoogleAdsClient
	 */
	protected $client;

	/**
	 * Ads constructor.
	 *
	 * @param GoogleAdsClient $client
	 * @param PositiveInteger $id
	 */
	public function __construct( GoogleAdsClient $client, PositiveInteger $id ) {
		$this->client = $client;
		$this->id     = $id;
	}

	/**
	 * Get billing status.
	 *
	 * @return string
	 */
	public function get_billing_status(): string {
		try {
			if ( ! $this->get_id() ) {
				return BillingSetupStatus::UNKNOWN;
			}

			$query    = $this->build_query( [ 'billing_setup.status' ], 'billing_setup' );
			$response = $this->query( $this->client, $this->get_id(), $query );

			foreach ( $response->iterateAllElements() as $row ) {
				$billing_setup = $row->getBillingSetup();
				$status        = BillingSetupStatus::label( $billing_setup->getStatus() );
				return apply_filters( 'woocommerce_gla_ads_billing_setup_status', $status, $this->get_id() );
			}
		} catch ( ApiException $e ) {
			// Do not act upon error as we might not have permission to access this account yet.
			if ( 'PERMISSION_DENIED' !== $e->getStatus() ) {
				do_action( 'gla_ads_client_exception', $e, __METHOD__ );
			}
		} catch ( ValidationException $e ) {
			// If no billing setups are found, just return UNKNOWN
			return BillingSetupStatus::UNKNOWN;
		}

		return apply_filters( 'woocommerce_gla_ads_billing_setup_status', BillingSetupStatus::UNKNOWN, $this->get_id() );
	}

	/**
	 * Accept a link from a merchant account.
	 *
	 * @param int $merchant_id Merchant Center account id.
	 * @throws Exception When a link is unavailable.
	 */
	public function accept_merchant_link( int $merchant_id ) {
		$link = $this->get_merchant_link( $merchant_id );

		if ( $link->getStatus() === MerchantCenterLinkStatus::ENABLED ) {
			return;
		}

		$link->setStatus( MerchantCenterLinkStatus::ENABLED );

		$operation = new MerchantCenterLinkOperation();
		$operation->setUpdate( $link );
		$operation->setUpdateMask( FieldMasks::allSetFieldsOf( $link ) );

		$this->client->getMerchantCenterLinkServiceClient()->mutateMerchantCenterLink(
			$this->get_id(),
			$operation
		);
	}

	/**
	 * Get the link from a merchant account.
	 *
	 * @param int $merchant_id Merchant Center account id.
	 *
	 * @return MerchantCenterLink
	 * @throws Exception When the merchant link hasn't been created.
	 */
	private function get_merchant_link( int $merchant_id ): MerchantCenterLink {
		$response = $this->client->getMerchantCenterLinkServiceClient()->listMerchantCenterLinks(
			$this->get_id()
		);

		foreach ( $response->getMerchantCenterLinks() as $link ) {
			/** @var MerchantCenterLink $link */
			if ( $merchant_id === absint( $link->getId() ) ) {
				return $link;
			}
		}

		throw new Exception( __( 'Merchant link is not available to accept', 'google-listings-and-ads' ) );
	}

}
