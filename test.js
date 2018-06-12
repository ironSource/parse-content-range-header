const { expect } = require('chai')
const parseContentRangeHeader = require('./index')

describe('parseContentRangeHeader', () => {
	it('parses a Content-Range header <unit> <range start>-<range end>/<size>', () => {
		let header = 'bytes 0-500/1000'
		let actual = parseContentRangeHeader(header)
		expect(actual).to.eql({
			isRangeSatisfiable: true,
			range: { start: 0, end: 500 },
			unit: 'bytes',
			isSizeKnown: true,
			size: 1000
		})
	})

	it('parses a Content-Range header <unit> */<size>', () => {
		let header = 'bytes */1000'
		let actual = parseContentRangeHeader(header)
		expect(actual).to.eql({
			isRangeSatisfiable: false,
			range: '*',
			unit: 'bytes',
			isSizeKnown: true,
			size: 1000
		})
	})

	it('parses a Content-Range header <unit> <range start>-<range end>/*', () => {
		let header = 'bytes 0-50/*'
		let actual = parseContentRangeHeader(header)
		expect(actual).to.eql({
			isRangeSatisfiable: true,
			range: { start: 0, end: 50 },
			unit: 'bytes',
			isSizeKnown: false,
			size: '*'
		})
	})

	it('throws an error if unit separator is missing', () => {
		let header = 'bytes0-500/1000'
		expect(() => {
			parseContentRangeHeader(header)
		}).to.throw(Error, 'missing unit separator')
	})

	it('throws an error if unit is missing', () => {
		let header = ' '
		expect(() => {
			parseContentRangeHeader(header)
		}).to.throw(Error, 'missing unit value')
	})

	it('throws an error if size separator is missing', () => {
		let header = 'bytes 0-100'
		expect(() => {
			parseContentRangeHeader(header)
		}).to.throw(Error, 'missing size separator')
	})

	it('throws an error if range is invalid', () => {
		let header = 'bytes 0500/1000'
		expect(() => {
			parseContentRangeHeader(header)
		}).to.throw(Error, 'invalid range')
	})

	it('throws an error if range start is not an integer', () => {
		let header = 'bytes kjhas-500/1000'
		expect(() => {
			parseContentRangeHeader(header)
		}).to.throw(Error, 'invalid range start value')
	})

	it('throws an error if range end is not an integer', () => {
		let header = 'bytes 0-i500/1000'
		expect(() => {
			parseContentRangeHeader(header)
		}).to.throw(Error, 'invalid range end value')
	})

	it('throws an error if range start is greater than range end', () => {
		let header = 'bytes 10-5/1000'
		expect(() => {
			parseContentRangeHeader(header)
		}).to.throw(Error, 'range start is greater than range end')
	})

	it('throws an error if size is known but is not an integer', () => {
		let header = 'bytes 0-500/lkjs'
		expect(() => {
			parseContentRangeHeader(header)
		}).to.throw(Error, 'invalid size value')
	})
})