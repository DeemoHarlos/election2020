const request = require('request')
const fs = require('fs')
const cheerio = require('cheerio')
const pad = require('pad')

var president = {
	'county': require('./town')
}
var sent = 0
var recv = 0

function getResult(county,town,obj) {
	sent++
	var url = `https://www.cec.gov.tw/pc/zh_TW/P1/n${county}00${town}00000000.html`
	var req = request(url, (err,res,body)=>{
		const $ = cheerio.load(body)
		var st = $('#divContent .trT>td:nth-child(5)')
		// if(county == '63000' && town == '00') console.log($.root().html());
		obj.votes.song  = parseInt($(st[0]).text().split(',').join(''))
		obj.votes.han   = parseInt($(st[1]).text().split(',').join(''))
		obj.votes.tsai  = parseInt($(st[2]).text().split(',').join(''))

		var url = `https://www.cec.gov.tw/pc/zh_TW/FP1/${county}000000000000.html`
		var req = request(url, (err,res,body)=>{
			const $ = cheerio.load(body)
			var st  = $('#divContent .trT>td:nth-child(5)')
			var st2 = $('#divContent .trT>td:nth-child(2)')
			var index = parseInt(town)
			obj.votes.invalid = parseInt($(st[index]).text().split(',').join(''))
			obj.total = parseInt($(st2[index]).text().split(',').join(''))

			recv++
			if(recv===sent) fs.writeFileSync('president.json',JSON.stringify(president))
		})
	})
}

function getAll (county,town,obj) {
	obj.votes = {}
	getResult(county,town,obj)
	console.log(`Sent : ${county} ${town}`)
}

getAll('00000','00',president)
president.county.forEach((ce,ci,ca)=>{
	getAll(ce.code,'00',ce)
	ce.town.forEach((te,ti,ta)=>{
		getAll(ce.code,te.code,te)
	})
})

setInterval(()=>{
	console.log(recv+' / '+sent)
},1000)