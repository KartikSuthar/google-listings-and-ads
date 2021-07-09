/**
 * Internal dependencies
 */
import checkErrors from './checkErrors';

function toRates( ...tuples ) {
	return tuples.map( ( [ countryCode, rate ] ) => ( {
		countryCode,
		rate,
	} ) );
}

function toTimes( ...tuples ) {
	return tuples.map( ( [ countryCode, time ] ) => ( {
		countryCode,
		time,
	} ) );
}

describe( 'checkErrors', () => {
	describe( 'Shipping rates', () => {
		let flatShipping;
		let manualShipping;

		beforeEach( () => {
			flatShipping = { shipping_rate: 'flat' };
			manualShipping = { shipping_rate: 'manual' };
		} );

		it( 'When the type of shipping rate is an invalid value, should not pass', () => {
			// Not set yet
			let errors = checkErrors( {}, [], [], [] );

			expect( errors ).toHaveProperty( 'shipping_rate' );
			expect( errors.shipping_rate ).toMatchSnapshot();

			// Invalid value
			errors = checkErrors( { shipping_rate: true }, [], [], [] );

			expect( errors ).toHaveProperty( 'shipping_rate' );
			expect( errors.shipping_rate ).toMatchSnapshot();

			// Invalid value
			errors = checkErrors( { shipping_rate: 'automatic' }, [], [], [] );

			expect( errors ).toHaveProperty( 'shipping_rate' );
			expect( errors.shipping_rate ).toMatchSnapshot();
		} );

		it( 'When the type of shipping rate is a valid value, should pass', () => {
			// Selected flat
			let errors = checkErrors( flatShipping, [], [], [] );

			expect( errors ).not.toHaveProperty( 'shipping_rate' );

			// Selected manual
			errors = checkErrors( manualShipping, [], [], [] );

			expect( errors ).not.toHaveProperty( 'shipping_rate' );
		} );

		describe( 'For flat type', () => {
			function createFreeShipping( threshold ) {
				return {
					...flatShipping,
					offers_free_shipping: true,
					free_shipping_threshold: threshold,
				};
			}

			it( `When there are any selected countries' shipping rates is not set, should not pass`, () => {
				const rates = toRates( [ 'US', 10.5 ], [ 'FR', 12.8 ] );
				const codes = [ 'US', 'JP', 'FR' ];

				const errors = checkErrors( flatShipping, rates, [], codes );

				expect( errors ).toHaveProperty( 'shipping_rate' );
				expect( errors.shipping_rate ).toMatchSnapshot();
			} );

			it( `When all selected countries' shipping rates are set, should pass`, () => {
				const rates = toRates( [ 'US', 10.5 ], [ 'FR', 12.8 ] );
				const codes = [ 'US', 'FR' ];

				const errors = checkErrors( flatShipping, rates, [], codes );

				expect( errors ).not.toHaveProperty( 'shipping_rate' );
			} );

			it( `When there are any shipping rates is < 0, should not pass`, () => {
				const rates = toRates( [ 'US', 10.5 ], [ 'JP', -0.01 ] );
				const codes = [ 'US', 'JP' ];

				const errors = checkErrors( flatShipping, rates, [], codes );

				expect( errors ).toHaveProperty( 'shipping_rate' );
				expect( errors.shipping_rate ).toMatchSnapshot();
			} );

			it( `When all shipping rates are ≥ 0, should pass`, () => {
				const rates = toRates( [ 'US', 1 ], [ 'JP', 0 ] );
				const codes = [ 'US', 'JP' ];

				const errors = checkErrors( flatShipping, rates, [], codes );

				expect( errors ).not.toHaveProperty( 'shipping_rate' );
			} );

			it( 'When the free shipping threshold is an invalid value, should not pass', () => {
				// Not set yet
				let freeShipping = createFreeShipping( null );
				const rates = toRates( [ 'JP', 2 ] );
				const codes = [ 'JP' ];

				let errors = checkErrors( freeShipping, rates, [], codes );

				expect( errors ).toHaveProperty( 'free_shipping_threshold' );
				expect( errors.free_shipping_threshold ).toMatchSnapshot();

				// Invalid value
				freeShipping = createFreeShipping( true );

				errors = checkErrors( freeShipping, rates, [], codes );

				expect( errors ).toHaveProperty( 'free_shipping_threshold' );
				expect( errors.free_shipping_threshold ).toMatchSnapshot();

				// Invalid range
				freeShipping = createFreeShipping( -0.01 );

				errors = checkErrors( freeShipping, rates, [], codes );

				expect( errors ).toHaveProperty( 'free_shipping_threshold' );
				expect( errors.free_shipping_threshold ).toMatchSnapshot();
			} );

			it( 'When the free shipping threshold ≥ 0, should pass', () => {
				// Free threshold is 0
				let freeShipping = createFreeShipping( 0 );
				const rates = toRates( [ 'JP', 2 ] );
				const codes = [ 'JP' ];

				let errors = checkErrors( freeShipping, rates, [], codes );

				expect( errors ).not.toHaveProperty(
					'free_shipping_threshold'
				);

				// Free threshold is a positive number
				freeShipping = createFreeShipping( 0.01 );

				errors = checkErrors( freeShipping, rates, [], codes );

				expect( errors ).not.toHaveProperty(
					'free_shipping_threshold'
				);
			} );
		} );
	} );

	describe( 'Shipping times', () => {
		let flatShipping;
		let manualShipping;

		beforeEach( () => {
			flatShipping = { shipping_time: 'flat' };
			manualShipping = { shipping_time: 'manual' };
		} );

		it( 'When the type of shipping time is an invalid value, should not pass', () => {
			// Not set yet
			let errors = checkErrors( {}, [], [], [] );

			expect( errors ).toHaveProperty( 'shipping_time' );
			expect( errors.shipping_time ).toMatchSnapshot();

			// Invalid value
			errors = checkErrors( { shipping_time: true }, [], [], [] );

			expect( errors ).toHaveProperty( 'shipping_time' );
			expect( errors.shipping_time ).toMatchSnapshot();

			// Invalid value
			errors = checkErrors( { shipping_time: 'automatic' }, [], [], [] );

			expect( errors ).toHaveProperty( 'shipping_time' );
			expect( errors.shipping_time ).toMatchSnapshot();
		} );

		it( 'When the type of shipping time is a valid value, should pass', () => {
			// Selected flat
			let errors = checkErrors( flatShipping, [], [], [] );

			expect( errors ).not.toHaveProperty( 'shipping_time' );

			// Selected manual
			errors = checkErrors( manualShipping, [], [], [] );

			expect( errors ).not.toHaveProperty( 'shipping_time' );
		} );

		describe( 'For flat type', () => {
			it( `When there are any selected countries' shipping times is not set, should not pass`, () => {
				const times = toTimes( [ 'US', 7 ], [ 'FR', 16 ] );
				const codes = [ 'US', 'JP', 'FR' ];

				const errors = checkErrors( flatShipping, [], times, codes );

				expect( errors ).toHaveProperty( 'shipping_time' );
				expect( errors.shipping_time ).toMatchSnapshot();
			} );

			it( `When all selected countries' shipping times are set, should pass`, () => {
				const times = toTimes( [ 'US', 7 ], [ 'FR', 16 ] );
				const codes = [ 'US', 'FR' ];

				const errors = checkErrors( flatShipping, [], times, codes );

				expect( errors ).not.toHaveProperty( 'shipping_time' );
			} );

			it( `When there are any shipping times is < 0, should not pass`, () => {
				const times = toTimes( [ 'US', 10 ], [ 'JP', -1 ] );
				const codes = [ 'US', 'JP' ];

				const errors = checkErrors( flatShipping, [], times, codes );

				expect( errors ).toHaveProperty( 'shipping_time' );
				expect( errors.shipping_time ).toMatchSnapshot();
			} );

			it( `When all shipping times are ≥ 0, should pass`, () => {
				const times = toTimes( [ 'US', 1 ], [ 'JP', 0 ] );
				const codes = [ 'US', 'JP' ];

				const errors = checkErrors( flatShipping, [], times, codes );

				expect( errors ).not.toHaveProperty( 'shipping_time' );
			} );
		} );
	} );

	describe( `For tax rate, if selected country codes include 'US'`, () => {
		let codes;

		beforeEach( () => {
			codes = [ 'US' ];
		} );

		it( `When the tax rate option is an invalid value, should not pass`, () => {
			// Not set yet
			let errors = checkErrors( {}, [], [], codes );

			expect( errors ).toHaveProperty( 'tax_rate' );
			expect( errors.tax_rate ).toMatchSnapshot();

			// Invalid value
			errors = checkErrors( { tax_rate: true }, [], [], codes );

			expect( errors ).toHaveProperty( 'tax_rate' );
			expect( errors.tax_rate ).toMatchSnapshot();

			// Invalid value
			errors = checkErrors( { tax_rate: 'automatic' }, [], [], codes );

			expect( errors ).toHaveProperty( 'tax_rate' );
			expect( errors.tax_rate ).toMatchSnapshot();
		} );

		it( 'When the tax rate option is a valid value, should pass', () => {
			// Selected destination
			const destinationTaxRate = { tax_rate: 'destination' };

			let errors = checkErrors( destinationTaxRate, [], [], codes );

			expect( errors ).not.toHaveProperty( 'tax_rate' );

			// Selected manual
			const manualTaxRate = { tax_rate: 'manual' };

			errors = checkErrors( manualTaxRate, [], [], codes );

			expect( errors ).not.toHaveProperty( 'tax_rate' );
		} );
	} );

	describe( 'Requirements', () => {
		it( 'When there are any requirements are not true, should not pass', () => {
			// Not set yet
			let errors = checkErrors( {}, [], [], [] );

			expect( errors ).toHaveProperty( 'website_live' );
			expect( errors.website_live ).toMatchSnapshot();

			expect( errors ).toHaveProperty( 'checkout_process_secure' );
			expect( errors.checkout_process_secure ).toMatchSnapshot();

			expect( errors ).toHaveProperty( 'payment_methods_visible' );
			expect( errors.payment_methods_visible ).toMatchSnapshot();

			expect( errors ).toHaveProperty( 'refund_tos_visible' );
			expect( errors.refund_tos_visible ).toMatchSnapshot();

			expect( errors ).toHaveProperty( 'contact_info_visible' );
			expect( errors.contact_info_visible ).toMatchSnapshot();

			// Invalid value
			const values = {
				website_live: false,
				checkout_process_secure: 1,
				payment_methods_visible: 'true',
				refund_tos_visible: [],
				contact_info_visible: {},
			};

			errors = checkErrors( values, [], [], [] );

			expect( errors ).toHaveProperty( 'website_live' );
			expect( errors.website_live ).toMatchSnapshot();

			expect( errors ).toHaveProperty( 'checkout_process_secure' );
			expect( errors.checkout_process_secure ).toMatchSnapshot();

			expect( errors ).toHaveProperty( 'payment_methods_visible' );
			expect( errors.payment_methods_visible ).toMatchSnapshot();

			expect( errors ).toHaveProperty( 'refund_tos_visible' );
			expect( errors.refund_tos_visible ).toMatchSnapshot();

			expect( errors ).toHaveProperty( 'contact_info_visible' );
			expect( errors.contact_info_visible ).toMatchSnapshot();
		} );

		it( 'When all requirements are true, should pass', () => {
			const values = {
				website_live: true,
				checkout_process_secure: true,
				payment_methods_visible: true,
				refund_tos_visible: true,
				contact_info_visible: true,
			};

			const errors = checkErrors( values, [], [], [] );

			expect( errors ).not.toHaveProperty( 'website_live' );
			expect( errors ).not.toHaveProperty( 'checkout_process_secure' );
			expect( errors ).not.toHaveProperty( 'payment_methods_visible' );
			expect( errors ).not.toHaveProperty( 'refund_tos_visible' );
			expect( errors ).not.toHaveProperty( 'contact_info_visible' );
		} );
	} );
} );
