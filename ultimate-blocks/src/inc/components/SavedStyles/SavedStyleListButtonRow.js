import React from 'react';
import { CustomToggleGroupControl } from '../../../blocks/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { __ } from '@wordpress/i18n';
import { connectWithStore } from '@Stores/StoreHelpers';
import SavedStylesManager from '@Managers/SavedStylesManager';

/**
 * Button row wrapper for saved style listing.
 *
 * @param {Object}   props                       component properties
 * @param {Function} props.setShowPreviewStatus  show saved styles' previews or hide them, will be supplied via HOC
 * @param {boolean}  props.isShowPreviewsEnabled status of show previews, will be supplied via HOC
 * @return {JSX.Element} saved styles list button row component
 * @class
 */
function SavedStyleListButtonRow( {
	setShowPreviewStatus,
	isShowPreviewsEnabled,
} ) {
	return (
		<div className={ 'ub-pro-saved-styles-listing-button-row' }>
			{ /* CustomToggleGroupControl replaces ButtonGroup, deprecated since WP 6.8 (console: "wp.components.ButtonGroup is deprecated") */ }
			<CustomToggleGroupControl
				className={ 'listing-preview-button-group' }
				hideLabelFromVision
				label={ __( 'Saved styles view', 'ultimate-blocks' ) }
				value={ isShowPreviewsEnabled ? 'previews' : 'listing' }
				onChange={ ( value ) => setShowPreviewStatus( value === 'previews' ) }
				options={ [
					{
						value: 'previews',
						icon: <FontAwesomeIcon icon={ 'eye' } />,
						label: __( 'show previews', 'ultimate-blocks' ),
					},
					{
						value: 'listing',
						icon: <FontAwesomeIcon icon={ 'list-ul' } />,
						label: __( 'show listing', 'ultimate-blocks' ),
					},
				] }
			/>
		</div>
	);
}

/**
 * Select mapping for store.
 *
 * @param {Object} select store select object
 * @return {Object} select mapping object
 */
const selectMapping = ( select ) => {
	const { isShowPreviewsEnabled } = select;
	return {
		isShowPreviewsEnabled: isShowPreviewsEnabled(),
	};
};

/**
 * Action mapping for store.
 *
 * @param {Object} dispatch store dispatch object
 * @return {Object} action mapping object
 */
const actionMapping = ( dispatch ) => {
	const { setShowPreviewStatus } = dispatch;
	return {
		setShowPreviewStatus,
	};
};

/**
 * @module SavedStyleListButtonRow
 */
export default connectWithStore(
	SavedStylesManager.storeNamespace,
	selectMapping,
	actionMapping
)( SavedStyleListButtonRow );
