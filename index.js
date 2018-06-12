module.exports = parseContentRangeHeader

/**
 *    @param  {String} headerValue - the value of a `Content-Range` header
 *    	The supported forms of this header are specified in this [RFC](https://tools.ietf.org/html/rfc7233#section-4.2)
 *    	and on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range#Syntax)
 *
 *    @return {ParseResult}
 *
 */
function parseContentRangeHeader(headerValue) {
	let unitSeparator = headerValue.indexOf(' ')

	if (unitSeparator === -1) {
		throw new Error('missing unit separator')
	}

	let unit = headerValue.substr(0, unitSeparator)

	if (unit.length === 0) {
		throw new Error('missing unit value')
	}

	let sizeSeparator = headerValue.indexOf('/', unitSeparator + 1)

	if (sizeSeparator === -1) {
		throw new Error('missing size separator')
	}

	let rangeSeparator = headerValue.indexOf('-', unitSeparator + 1)

	let range
	let isRangeSatisfied

	if (rangeSeparator > -1) {
		let rangeStart = parseInt(headerValue.substring(unitSeparator + 1, rangeSeparator))
		if (isNaN(rangeStart)) {
			throw new Error('invalid range start value')
		}

		let rangeEnd = parseInt(headerValue.substring(rangeSeparator + 1, sizeSeparator))
		if (isNaN(rangeEnd)) {
			throw new Error('invalid range end value')
		}

		if (rangeStart > rangeEnd) {
			throw new Error('range start is greater than range end')
		}

		range = { start: rangeStart, end: rangeEnd }
		isRangeSatisfied = true
	} else {
		range = headerValue.substring(unitSeparator + 1, sizeSeparator)
		if (range !== '*') {
			throw new Error('invalid range')
		}

		isRangeSatisfied = false
	}

	let size = headerValue.substring(sizeSeparator + 1)
	let isSizeKnown

	if (size === '*') {
		isSizeKnown = false

	} else {
		size = parseInt(size)
		if (isNaN(size)) {
			throw new Error('invalid size value')
		}

		isSizeKnown = true
	}

	/**
	 *    @name ParseResult
	 *    @type {Object}
	 *    @property {Object|String} range - range start and range end, if range is not satisfiable (`isRangeSatisfied === false`), then this will be a `*`
	 *    @property {Number} range.start
	 *    @property {Number} range.end
	 *    @property {Boolean} isRangeSatisfied - a flag indicating if the server can satisfy the range request or not
	 *    @property {String} unit - the unit of the range, usually this will be `bytes`
	 *    @property {Number|String} size - the full size of the resource. If the size is not known (`isSizeKnown === false`) then this will be a `*`
	 *    @property {Boolean} isSizeKnown - a flag indicating if the server knows the size of the resource or not
	 */
	return { range, isRangeSatisfied, unit, size, isSizeKnown }
}