/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { useAppDispatch } from '.~/data';
import useWindowFocusCallbackIntervalEffect from '.~/hooks/useWindowFocusCallbackIntervalEffect';
import useDispatchCoreNotices from '.~/hooks/useDispatchCoreNotices';

/**
 * Make API call to complete Google Ads account setup.
 */
const completeGoogleAdsAccountSetup = async () => {
	return apiFetch( {
		path: `/wc/gla/ads/accounts`,
		method: 'POST',
	} );
};

const useAutoCheckBillingStatusEffect = ( onStatusApproved = () => {} ) => {
	const { createNotice } = useDispatchCoreNotices();
	const { receiveGoogleAdsAccountBillingStatus } = useAppDispatch();

	const checkStatusAndCompleteSetup = useCallback( async () => {
		const billingStatus = await apiFetch( {
			path: '/wc/gla/ads/billing-status',
		} );

		if ( billingStatus.status !== 'approved' ) {
			return;
		}

		try {
			await completeGoogleAdsAccountSetup();
			await onStatusApproved();
			receiveGoogleAdsAccountBillingStatus( billingStatus );
		} catch ( e ) {
			createNotice(
				'error',
				__(
					'Unable to complete your Google Ads account setup. Please try again later.',
					'google-listings-and-ads'
				)
			);
		}
	}, [
		createNotice,
		onStatusApproved,
		receiveGoogleAdsAccountBillingStatus,
	] );

	useWindowFocusCallbackIntervalEffect( checkStatusAndCompleteSetup, 30 );
};

export default useAutoCheckBillingStatusEffect;
