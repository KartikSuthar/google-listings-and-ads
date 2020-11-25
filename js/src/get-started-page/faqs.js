/**
 * External dependencies
 */
import { Panel, PanelBody, PanelRow } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Link } from '@woocommerce/components';
import { recordEvent } from '@woocommerce/tracks';

const recordToggleEvent = ( id, isOpened ) => {
	recordEvent( 'gla_get_started_faq', {
		id,
		action: isOpened ? 'expand' : 'collapse',
	} );
};

const recordLinkClickEvent = ( id, href ) => {
	recordEvent( 'gla_get_started_faq_link_clicked', {
		id,
		href,
	} );
};

const Faqs = () => {
	const getPanelToggleHandler = ( id ) => ( isOpened ) => {
		recordToggleEvent( id, isOpened );
	};

	const getLinkClickHandler = ( id ) => ( event ) => {
		recordLinkClickEvent( id, event.currentTarget.href );
	};

	return (
		<Panel
			header={ __(
				'Frequently asked questions',
				'google-listings-and-ads'
			) }
		>
			<PanelBody
				title={ __(
					'What is Google Merchant Center?',
					'google-listings-and-ads'
				) }
				initialOpen={ false }
				onToggle={ getPanelToggleHandler(
					'what-is-google-merchant-center'
				) }
			>
				<PanelRow>
					<div>
						{ createInterpolateElement(
							__(
								'Google Merchant Center is a tool that helps you upload your shop and product data to Google. This allows your data to be available for free product listings on Google Shopping, paid ad campaigns, and other Google services. <link>Learn more about Google Merchant Center</link>',
								'google-listings-and-ads'
							),
							{
								link: (
									<Link
										type="external"
										href="https://www.google.com/retail/solutions/merchant-center/"
										target="_blank"
										onClick={ getLinkClickHandler(
											'what-is-google-merchant-center'
										) }
									/>
								),
							}
						) }
					</div>
				</PanelRow>
			</PanelBody>
			<PanelBody
				title={ __(
					'How do I get my products to be shown on Google?',
					'google-listings-and-ads'
				) }
				initialOpen={ false }
				onToggle={ getPanelToggleHandler( 'how-do-i-get-my-products' ) }
			>
				<PanelRow>
					{ __(
						'Opting for your product information to be shown on surfaces across Google and Shopping ads allows people to see goods from your shop on various Google platforms, including sponsored and non-sponsored results on Google Search and Google Images.',
						'google-listings-and-ads'
					) }
				</PanelRow>
			</PanelBody>
			<PanelBody
				title={ __(
					'What do I need to do to get started?',
					'google-listings-and-ads'
				) }
				initialOpen={ false }
				onToggle={ getPanelToggleHandler( 'what-do-i-need-to-do' ) }
			>
				<PanelRow>
					<div>
						{ createInterpolateElement(
							__(
								'When you set up this WooCommerce integration, you will be prompted to connect or create a WordPress.com account, a Google account, and a Google Merchant Center account. <link>Learn more about Google’s policies and requirements.</link>',
								'google-listings-and-ads'
							),
							{
								link: (
									<Link
										type="external"
										href="https://support.google.com/merchants/answer/6363310"
										target="_blank"
										onClick={ getLinkClickHandler(
											'what-do-i-need-to-do'
										) }
									/>
								),
							}
						) }
					</div>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

export default Faqs;
