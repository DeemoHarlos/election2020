const request = require('request')
const requestSync = require('sync-request')
const fs = require('fs')
const cheerio = require('cheerio')
const pad = require('pad')

var data = {
	'county': require('./town')
}

function getResult(county,town,obj) {
	obj.president = {}
	getPresident(county,town,obj.president)
	obj.party = {}
	getParty(county,town,obj.party)
}

function getInfo() {
	getPresidentInfo()
	getPartyInfo()
}

function getPresident(county,town,obj) {
	obj.votes = []
	var url = `https://www.cec.gov.tw/pc/zh_TW/P1/n${county}00${town}00000000.html`
	var res = requestSync('GET', url)
	const $ = cheerio.load(res.getBody())
	var votes = $('#divContent .trT>td:nth-child(5)')
	votes.each((i,vote)=>{
		obj.votes.push(parseInt($(vote).text().split(',').join('')))
	})

	var url2 = `https://www.cec.gov.tw/pc/zh_TW/FP1/${county}00${town}00000000.html`
	var res2 = requestSync('GET', url2)
	const $2 = cheerio.load(res2.getBody())
	var invalid = $2('#divContent .trT>td:nth-child(5)')
	obj.invalid = parseInt($2(invalid[0]).text().split(',').join(''))
	var total   = $2('#divContent .trT>td:nth-child(2)')
	obj.total   = parseInt($2(total[0]).text().split(',').join(''))
	var vote    = $2('#divContent .trT>td:nth-child(3)')
	obj.novote  = obj.total - parseInt($2(vote[0]).text().split(',').join(''))
}

function getParty(county,town,obj) {
	obj.votes = []
	var url = `https://www.cec.gov.tw/pc/zh_TW/L4/n${county}00${town}00000000.html`
	var res = requestSync('GET', url)
	const $ = cheerio.load(res.getBody())
	var votes = $('#divContent .trT>td:nth-child(3)')
	votes.each((i,vote)=>{
		obj.votes.push(parseInt($(vote).text().split(',').join('')))
	})

	var url2 = `https://www.cec.gov.tw/pc/zh_TW/S4/${county}00${town}00000000.html`
	var res2 = requestSync('GET', url2)
	const $2 = cheerio.load(res2.getBody())
	var invalid = $2('#divContent .trT>td:nth-child(5)')
	obj.invalid = parseInt($2(invalid[0]).text().split(',').join(''))
	var total   = $2('#divContent .trT>td:nth-child(2)')
	obj.total   = parseInt($2(total[0]).text().split(',').join(''))
	var vote    = $2('#divContent .trT>td:nth-child(3)')
	obj.novote  = obj.total - parseInt($2(vote[0]).text().split(',').join(''))
}

function getPresidentInfo() {
	data.president.info = []
	var url = `https://www.cec.gov.tw/pc/zh_TW/P1/n00000000000000000.html`
	var res = requestSync('GET', url)
	const $ = cheerio.load(res.getBody())
	var names   = $('#divContent .trT>td:nth-child(3)')
	var indexes = $('#divContent .trT>td:nth-child(2)')
	names.each((i,name)=>{
		data.president.info.push({
			'index': parseInt($(indexes[i]).text()),
			'name' : $(name).text()
		})
	})
}

function getPartyInfo() {
	data.party.info = []
	var url = `https://www.cec.gov.tw/pc/zh_TW/L4/n00000000000000000.html`
	var res = requestSync('GET', url)
	const $ = cheerio.load(res.getBody())
	var names   = $('#divContent .trT>td:nth-child(2)')
	var indexes = $('#divContent .trT>td:nth-child(1)')
	names.each((i,name)=>{
		data.party.info.push({
			'index': parseInt($(indexes[i]).text()),
			'name' : $(name).text()
		})
	})
}

getResult('00000','00',data)
getInfo()
data.county.forEach((ce,ci,ca)=>{
	process.stdout.write(`Gathering data from ${ce.name} ... `);
	getResult(ce.code,'00',ce)
	ce.town.forEach((te,ti,ta)=>{
		getResult(ce.code,te.code,te)
	})
	console.log(`Completed.`)
})

fs.writeFileSync('data.json',JSON.stringify(data))