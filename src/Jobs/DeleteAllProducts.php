<?php
declare( strict_types=1 );

namespace Automattic\WooCommerce\GoogleListingsAndAds\Jobs;

use Automattic\WooCommerce\GoogleListingsAndAds\ActionScheduler\ActionSchedulerInterface;
use Automattic\WooCommerce\GoogleListingsAndAds\Google\BatchProductRequestEntry;
use Automattic\WooCommerce\GoogleListingsAndAds\Product\ProductSyncer;
use Automattic\WooCommerce\GoogleListingsAndAds\Product\ProductSyncerException;

defined( 'ABSPATH' ) || exit;

/**
 * Class DeleteAllProducts
 *
 * Deletes all WooCommerce products from Google Merchant Center.
 *
 * @package Automattic\WooCommerce\GoogleListingsAndAds\Jobs
 */
class DeleteAllProducts extends AbstractBatchedActionSchedulerJob {

	/**
	 * @var ProductSyncer
	 */
	protected $product_syncer;

	/**
	 * SyncProducts constructor.
	 *
	 * @param ActionSchedulerInterface  $action_scheduler
	 * @param ActionSchedulerJobMonitor $monitor
	 * @param ProductSyncer             $product_syncer
	 */
	public function __construct( ActionSchedulerInterface $action_scheduler, ActionSchedulerJobMonitor $monitor, ProductSyncer $product_syncer ) {
		$this->product_syncer = $product_syncer;
		parent::__construct( $action_scheduler, $monitor );
	}

	/**
	 * Get the name of the job.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'delete_all_products';
	}

	/**
	 * Get a single batch of items.
	 *
	 * If no items are returned the job will stop.
	 *
	 * @param int $batch_number The batch number increments for each new batch in the job cycle.
	 *
	 * @return array
	 */
	protected function get_batch( int $batch_number ): array {
		return wc_get_products(
			[
				'limit'  => $this->get_batch_size(),
				'offset' => $this->get_query_offset( $batch_number ),
				'return' => 'ids',
			]
		);
	}

	/**
	 * Process batch items.
	 *
	 * @param string[] $items An array of Google product IDs mapped to WooCommerce product IDs as their key.
	 *
	 * @throws ProductSyncerException If an error occurs. The exception will be logged by ActionScheduler.
	 */
	protected function process_items( array $items ) {
		$product_entries = $this->generate_delete_requests( $items );
		$this->product_syncer->delete_by_batch_requests( $product_entries );
	}

	/**
	 * @param string[] $product_id_map An array of Google product IDs mapped to WooCommerce product IDs as their key.
	 *
	 * @return BatchProductRequestEntry[]
	 */
	protected function generate_delete_requests( array $product_id_map ): array {
		$product_entries = [];
		foreach ( $product_id_map as $wc_product_id => $google_product_id ) {
			$product_entries[] = new BatchProductRequestEntry( $wc_product_id, $google_product_id );
		}

		return $product_entries;
	}
}
