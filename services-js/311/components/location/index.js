// @flow

// Container for the LocationMap component

import { connect } from 'react-redux';
import { setLocation } from '../../data/store/request';
import withGoogleMaps from './with-google-maps';
import LocationMap from './LocationMap';
import type { ValueProps, ActionProps } from './LocationMap';
import type { State, Dispatch } from '../../data/store';

const mapStateToProps = ({ keys, request }: State): ValueProps => ({
  googleApiKey: keys.googleApi,
  location: request.location,
  address: request.address,
});

const mapDispatchToProps = (dispatch: Dispatch): ActionProps => ({
  dispatchLocation: (location, address) => { dispatch(setLocation(location, address)); },
});


// withGoogleMaps inside of connect so that it gets the googleApiKey prop
export default connect(mapStateToProps, mapDispatchToProps)(withGoogleMaps(['places'])(LocationMap));
