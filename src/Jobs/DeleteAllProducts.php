<?php
declare( strict_types=1 );

namespace Automattic\WooCommerce\GoogleListingsAndAds\Jobs;

use Automattic\WooCommerce\GoogleListingsAndAds\ActionScheduler\ActionSchedulerInterface;
use Automattic\WooCommerce\GoogleListingsAndAds\Product\BatchProductHelper;
use Automattic\WooCommerce\GoogleListingsAndAds\Product\ProductRepository;
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
	 * @var BatchProductHelper
	 */
	protected $batch_product_helper;

	/**
	 * @var ProductRepository
	 */
	protected $product_repository;

	/**
	 * SyncProducts constructor.
	 *
	 * @param ActionSchedulerInterface  $action_scheduler
	 * @param ActionSchedulerJobMonitor $monitor
	 * @param ProductSyncer             $product_syncer
	 * @param BatchProductHelper        $batch_product_helper
	 * @param ProductRepository         $product_repository
	 */
	public function __construct(
		ActionSchedulerInterface $action_scheduler,
		ActionSchedulerJobMonitor $monitor,
		ProductSyncer $product_syncer,
		BatchProductHelper $batch_product_helper,
		ProductRepository $product_repository
	) {
		$this->product_syncer       = $product_syncer;
		$this->batch_product_helper = $batch_product_helper;
		$this->product_repository   = $product_repository;
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
	 * @return int[]
	 */
	protected function get_batch( int $batch_number ): array {
		return $this->product_repository->find_synced_product_ids( $this->get_batch_size(), $this->get_query_offset( $batch_number ) );
	}

	/**
	 * Process batch items.
	 *
	 * @param int[] $items A single batch of WooCommerce product IDs from the get_batch() method.
	 *
	 * @throws ProductSyncerException If an error occurs. The exception will be logged by ActionScheduler.
	 */
	protected function process_items( array $items ) {
		$products        = $this->product_repository->find_by_ids( $items );
		$product_entries = $this->batch_product_helper->generate_delete_request_entries( $products );
		$this->product_syncer->delete_by_batch_requests( $product_entries );
	}
}