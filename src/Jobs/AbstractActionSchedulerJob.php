<?php
declare( strict_types=1 );

namespace Automattic\WooCommerce\GoogleListingsAndAds\Jobs;

use Automattic\WooCommerce\GoogleListingsAndAds\ActionScheduler\ActionSchedulerInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Class AbstractActionSchedulerJob
 *
 * Abstract class for jobs that use ActionScheduler.
 *
 * @package Automattic\WooCommerce\GoogleListingsAndAds\Jobs
 */
abstract class AbstractActionSchedulerJob implements ActionSchedulerJobInterface {

	/**
	 * @var ActionSchedulerInterface
	 */
	protected $action_scheduler;

	/**
	 * @var ActionSchedulerJobMonitor
	 */
	protected $monitor;

	/**
	 * AbstractActionSchedulerJob constructor.
	 *
	 * @param ActionSchedulerInterface  $action_scheduler
	 * @param ActionSchedulerJobMonitor $monitor
	 */
	public function __construct( ActionSchedulerInterface $action_scheduler, ActionSchedulerJobMonitor $monitor ) {
		$this->action_scheduler = $action_scheduler;
		$this->monitor          = $monitor;
	}

	/**
	 * Can the job start.
	 *
	 * @param array $args
	 *
	 * @return bool Returns true if the job can start.
	 */
	protected function can_start( $args = [] ): bool {
		if ( $this->is_running( $args ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Check if this job is running.
	 *
	 * The job is considered to be running if the "process_item" action is currently pending or in-progress.
	 *
	 * @param array $args
	 *
	 * @return bool
	 */
	protected function is_running( $args = [] ): bool {
		return false !== $this->action_scheduler->next_scheduled_action( $this->get_process_item_hook(), $args );
	}

	/**
	 * Get the base name for the job's scheduled actions.
	 *
	 * @return string
	 */
	protected function get_hook_base_name() {
		return 'gla/jobs/' . $this->get_name() . '/';
	}

	/**
	 * Get the hook name for the "process item" action.
	 *
	 * This method is required by the job monitor.
	 *
	 * @return string
	 */
	public function get_process_item_hook(): string {
		return $this->get_hook_base_name() . 'process_item';
	}
}
