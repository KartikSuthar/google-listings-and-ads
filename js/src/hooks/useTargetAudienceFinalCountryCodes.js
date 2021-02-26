/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../data';

/**
 * Gets the final country codes from the Target Audience page.
 * This will call the `getTargetAudience` and `getCountries` selectors.
 * Returns `{ loading, data }`.
 *
 * `loading` is true when both `getTargetAudience` and `getCountries` are still resolving.
 *
 * `data` is an array of all supported country codes when users selected `all` in target audience page;
 * else, an array of selected country codes in target audience page.
 */
const useTargetAudienceFinalCountryCodes = () => {
	return useSelect( ( select ) => {
		const { getTargetAudience, getCountries, isResolving } = select(
			STORE_KEY
		);

		const targetAudience = getTargetAudience();
		const supportedCountries = getCountries();

		const targetAudienceLoading = isResolving( 'getTargetAudience' );
		const countriesLoading = isResolving( 'getCountries' );

		const loading = targetAudienceLoading || countriesLoading;
		const data =
			targetAudience?.location === 'all'
				? supportedCountries && Object.keys( supportedCountries )
				: targetAudience?.countries;

		return {
			loading,
			data: ! loading && data,
		};
	} );
};

export default useTargetAudienceFinalCountryCodes;