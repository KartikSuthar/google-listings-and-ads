/**
 * External dependencies
 */
import isEqual from 'lodash/isEqual';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { Form } from '@woocommerce/components';
import { getNewPath } from '@woocommerce/navigation';

/**
 * Internal dependencies
 */
import useAdminUrl from '.~/hooks/useAdminUrl';
import useNavigateAwayPromptEffect from '.~/hooks/useNavigateAwayPromptEffect';
import SetupAdsFormContent from './setup-ads-form-content';
import useSetupCompleteCallback from './useSetupCompleteCallback';
import validateForm from '.~/utils/paid-ads/validateForm';

// when amount is null or undefined in an onChange callback,
// it will cause runtime error with the Form component.
const initialValues = {
	amount: 0,
	country: [],
};

const SetupAdsForm = () => {
	const [ editedValues, setEditedValues ] = useState( initialValues );
	const [ isSubmitted, setSubmitted ] = useState( false );
	const [ handleSetupComplete, isSubmitting ] = useSetupCompleteCallback();
	const adminUrl = useAdminUrl();

	const handleValidate = ( values ) => {
		return validateForm( values );
	};

	useEffect( () => {
		if ( isSubmitted ) {
			// Force reload WC admin page to initiate the relevant dependencies of the Dashboard page.
			const nextPath = getNewPath(
				{ guide: 'campaign-creation-success' },
				'/google/dashboard'
			);
			window.location.href = adminUrl + nextPath;
		}
	}, [ isSubmitted, adminUrl ] );

	const didCampaignChanged = ! isEqual( initialValues, editedValues );
	const shouldPreventLeave = didCampaignChanged && ! isSubmitted;

	useNavigateAwayPromptEffect(
		__(
			'You have unsaved campaign data. Are you sure you want to leave?',
			'google-listings-and-ads'
		),
		shouldPreventLeave
	);

	return (
		<Form
			initialValues={ initialValues }
			validate={ handleValidate }
			onChangeCallback={ ( _, values ) => {
				setEditedValues( values );
			} }
			onSubmitCallback={ ( values ) => {
				const { amount, country: countryArr } = values;
				const country = countryArr && countryArr[ 0 ];
				handleSetupComplete( amount, country, () => {
					setSubmitted( true );
				} );
			} }
		>
			{ ( formProps ) => {
				const mixedFormProps = {
					...formProps,
					// TODO: maybe move all API calls in useSetupCompleteCallback to ~./data
					isSubmitting,
				};
				return <SetupAdsFormContent formProps={ mixedFormProps } />;
			} }
		</Form>
	);
};

export default SetupAdsForm;
