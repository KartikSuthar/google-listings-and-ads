/**
 * External dependencies
 */
import { CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createInterpolateElement, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import AppModal from '.~/components/app-modal';
import AppDocumentationLink from '.~/components/app-documentation-link';
import { useAppDispatch } from '.~/data';
import './index.scss';
import useApiFetchCallback from '.~/hooks/useApiFetchCallback';
import AppButton from '.~/components/app-button';

const TermsModal = ( props ) => {
	const { onRequestClose } = props;
	const [ agree, setAgree ] = useState( false );
	const { receiveMCAccount } = useAppDispatch();
	const [ fetchCreateMCAccount, { loading } ] = useApiFetchCallback( {
		path: `/wc/gla/mc/accounts`,
		method: 'POST',
	} );

	const handleCreateAccountClick = async () => {
		try {
			const data = await fetchCreateMCAccount();

			receiveMCAccount( data );

			onRequestClose();
		} catch ( error ) {
			console.log( error );

			// TODO: handle HTTP 503 with retry-after.
		}
	};

	return (
		<AppModal
			className="gla-mc-terms-modal"
			title={ __(
				'Create Google Merchant Center Account',
				'google-listings-and-ads'
			) }
			buttons={ [
				<AppButton
					key="1"
					isPrimary
					loading={ loading }
					disabled={ ! agree }
					onClick={ handleCreateAccountClick }
				>
					{ __( 'Create account', 'google-listings-and-ads' ) }
				</AppButton>,
			] }
			onRequestClose={ onRequestClose }
		>
			<p className="main">
				{ __(
					'By creating a Google Merchant Center account, you agree to the following terms and conditions:',
					'google-listings-and-ads'
				) }
			</p>
			<p>
				{ createInterpolateElement(
					__(
						'You agree to comply with Google’s terms and policies, including <link>Google Merchant Center Terms of Service</link>.',
						'google-listings-and-ads'
					),
					{
						link: (
							<AppDocumentationLink
								context="setup-mc"
								linkId="google-mc-terms-of-service"
								href="https://support.google.com/merchants/answer/160173"
							/>
						),
					}
				) }
			</p>
			<CheckboxControl
				label={ __(
					'I have read and accept these terms',
					'google-listings-and-ads'
				) }
				checked={ agree }
				onChange={ setAgree }
			/>
		</AppModal>
	);
};

export default TermsModal;
