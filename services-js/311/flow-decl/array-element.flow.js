// @flow
/* eslint no-unused-vars: 0 */

// Flow type to pull the element type out of an Array. Useful for when
// apollo-codegen generates responses with the Array type and we want to
// make a type for a single one of its elements.

type _ArrayElement<El, Arr: Array<El>> = El;
type $ArrayElement<Arr> = _ArrayElement<*, Arr>;
