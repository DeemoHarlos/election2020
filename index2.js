var lonmin = 119.34
var lonmax = 122.01
var latmin = 21.86
var latmax = 25.4
var width = lonmax-lonmin
var height = latmax-latmin
var scale = 300

var colors = {
	president: [ '#FF6310','#000099','#1B9431' ],
	party: [ '#FF0000', '#000080', '#FF6310', '#633f99', '#A73f24',
	         '#F9BE01', '#FFDB00', '#009e96', '#000099', '#5BBEDE',
	         '#FF0000', '#99E64D', '#EAD9A5', '#1B9431', '#28C8C8',
	         '#51458B', '#77AEA5', '#FFEA00', '#AB6300' ],
	invalid: '#888888',
	novote : '#333333'
}

var typeKey = ['president', 'party']
var typeName = ['正副總統', '不分區立委']

var x = d3.scaleLinear().range([0,width*scale] ).domain([lonmin,lonmax])
var y = d3.scaleLinear().range([height*scale,0]).domain([latmin,latmax])
var svg = d3.select('#map').append('svg')
            .attr('width', width*scale)
            .attr('height', height*scale)
var arc = [
	d3.arc()
		.innerRadius(29.5)
		.outerRadius(25)
		.cornerRadius(0)
		.padAngle(0), 
	d3.arc()
		.innerRadius(30)
		.outerRadius(50)
		.cornerRadius(0)
		.padAngle(0)
]

function drawMap(g,geo){
	if(geo.type === 'MultiPolygon'){
		geo.coordinates.forEach((ge,gi,ga)=>{
			g.append('path').data(ge)
			 .attr('d',d3.line().x(d=>x(d[0])).y(d=>y(d[1])))
		})	
	}
	else {
		g.append('path').data(geo.coordinates)
		 .attr('d',d3.line().x(d=>x(d[0])).y(d=>y(d[1])))
	} 
}

function hoverUpdate(d) {
	var t = parseInt($('#type' ).value)
	var c = parseInt($('#cand' ).value)
	var o = parseInt($('#other').value)
	drawPie(d, 2, t, o)
	d3.select('#piename' ).text(d === data ? '全國' : d.name)
	var value = getValue(d[typeKey[t]], t, c, o)
	d3.select('#pievalue').text(Math.round(value*1000)/10 + '%')
}

function drawCounty(){
	var counties = svg.append('g').attr('id', 'counties')
	county.features.forEach((e,i,a)=>{
		var g = counties.append('g')
			.attr('id','county' + e.properties.COUNTYCODE)
			.attr('class','county')
		drawMap(g,e.geometry)
		var d = data.county.find(cty=>cty.code === e.properties.COUNTYCODE)
		g.on('mouseover', function() { hoverUpdate(d   ) })
		g.on('mouseout' , function() { hoverUpdate(data) })
	})
	d3.select('#county09007').attr('transform','translate(100,320)')
	d3.select('#county09020').attr('transform','translate(400,0)')
	d3.select('#county09020').select('path:nth-last-child(1)')
	                         .attr('transform','translate(-250,100)')
	d3.select('#county09020').select('path:nth-last-child(2)')
	                         .attr('transform','translate(-250,100)')
}

function drawTown(){
	var towns = svg.append('g').attr('id', 'towns')
	town.features.forEach((e,i,a)=>{
		var g = towns.append('g')
			.attr('id','town' + e.properties.TOWNCODE.slice(0,7))
			.attr('class','town county' + e.properties.TOWNCODE.slice(0,5))
		drawMap(g,e.geometry)
		var d1 = data.county.find(cty=>cty.code === e.properties.COUNTYCODE)
		var d  = d1  .town  .find(twn=>d1.code+twn.code+'0' === e.properties.TOWNCODE)
		g.on('mouseover', function() { hoverUpdate(d   ) })
		g.on('mouseout' , function() { hoverUpdate(data) })
	})
	d3.selectAll('.county09007').attr('transform','translate(100,320)')
	d3.selectAll('.county09020').attr('transform','translate(400,0)')
	d3.select('#town0902006').attr('transform','translate(150,100)')
}

function arraySum(arr) {
	var total = 0
	arr.forEach((e,i,a)=>{ total += e })
	return total
}

function getValue(v, t, c, o) {
	var total = arraySum(v.votes)
	if (o > 0) total += v.invalid
	if (o > 1) total += v.novote
	if (c === 0 ) return (v.votes[t?13:2] - v.votes[t? 8:1]) / total
	if (c === -1) return v.invalid / total
	if (c === -2) return 1 - v.novote / total
	if (c  >  0 ) return v.votes[c-1] / total
	return 0
}

function setColor(value, t, c, min, max){
	var sc = 1 / (max > -min ? max : -min)
	if (c === 0) {
		var color1 = d3.hsv(colors[typeKey[t]][t?13:2])
		var color2 = d3.hsv(colors[typeKey[t]][t? 8:1])
		if (value > 0) return d3.hsv(color1.h, color1.s,  value * .95 * sc + .05) + ''
		else           return d3.hsv(color2.h, color2.s, -value * .95 * sc + .05) + ''
	}
	var color = d3.hsv('#000000')
	if (c === -1) color = d3.hsv(colors.invalid)
	if (c === -2) color = d3.hsv(colors.novote)
	if (c  >  0 ) color = d3.hsv(colors[typeKey[t]][c-1])
	return d3.hsv(color.h, color.s, value * .95 * sc + .05) + ''
}

function drawPie(d, i, t, o) {
	var v = d[typeKey[t]]
	var arr = []
	var path = d3.select(`#pie${i}`).select('g.path')
	var text = d3.select(`#pie${i}`).select('g.text')
	path.selectAll('path').remove()
	text.selectAll('text').remove()
	v.votes.forEach((e,i,a)=>{
		arr.push(e)
		path.append('path').style('fill',colors[typeKey[t]][i])
		text.append('text')
	})
	if (o > 0) {
		arr.push(v.invalid)
		path.append('path').style('fill',colors.invalid)
		text.append('text')
	}
	if (o > 1) {
		arr.push(v.novote)
		path.append('path').style('fill',colors.novote)
		text.append('text')
	}
	var arcs = d3.pie().sortValues(null)(arr)
	var total = arraySum(arr)

	path.selectAll('path').data(arcs).attr('d',arc[i-1])
	text.selectAll('text').data(arcs)
		.attr('x',d=>arc[i-1].centroid(d)[0]).attr('y',d=>arc[i-1].centroid(d)[1]+2)
		.text(d=>Math.round(d.value*1000/total)/10 + '%')
		.style('display', d=>(d.value*1000/total < 30 || i === 1) ? 'none' : 'initial')
}

function changeVoteData(){
	var m = parseInt($('#mode' ).value)
	var t = parseInt($('#type' ).value)
	var c = parseInt($('#cand' ).value)
	var o = parseInt($('#other').value)
	var min, max;

	data.county.forEach((e,i,a)=>{
		e.town.forEach((te,ti,ta)=>{
			var value = getValue(te[typeKey[t]], t, c, o)
			if (min === undefined || value < min) min = value
			if (max === undefined || value > max) max = value
		})
	})

	if (m) {
		data.county.forEach((e,i,a)=>{
			e.town.forEach((te,ti,ta)=>{
				var v = te[typeKey[t]]
				var value = getValue(v, t, c, o)
				var town = d3.select('#town'+e.code+te.code).data([v])
				town.selectAll('path').style('fill',setColor(value, t, c, min, max))
			})
		})
	} else {
		data.county.forEach((e,i,a)=>{
			var v = e[typeKey[t]]
			var value = getValue(v, t, c, o)
			var county = d3.select('#county'+e.code).data([v])
			county.selectAll('path').style('fill',setColor(value, t, c, min, max))
		})
	}

	d3.select('#piename' ).text('全國')
	var value = getValue(data[typeKey[t]], t, c, o)
	d3.select('#pievalue').text(Math.round(value*1000)/10 + '%')
	d3.select('#pietype' ).text(typeName[t])
	var cand
	     if (c ===  0) cand = '綠藍差距'
	else if (c === -1) cand = '廢票'
	else if (c === -2) cand = '投票率'
	else               cand = c + '. ' + data[typeKey[t]].info[c-1].name
	d3.select('#piecand' ).text(cand)
	drawPie(data, 1, t, o)
	drawPie(data, 2, t, o)
}

function setMode(m) {
	if (m) {
		d3.select('#counties').style('display','none')
		d3.select('#towns'   ).style('display','initial')
	} else {
		d3.select('#counties').style('display','initial')
		d3.select('#towns'   ).style('display','none')
	}
}

function setCand(t) {
	var c = parseInt($('#cand').value)
	var candidate = d3.select('#cand')
	candidate.selectAll('option').remove()
	candidate.append('option').text('綠藍差距').attr('value', 0)
	data[typeKey[t]].info.forEach((e,i,a)=>{
		candidate.append('option').text(e.index + '. ' + e.name).attr('value', e.index)
	})
	candidate.append('option').text('廢票').attr('value', -1)
	candidate.append('option').text('投票率').attr('value', -2)
	if (c > 0) $('#cand').value = 0
	else $('#cand').value = c
}

d3.select('#other').on('change',function() {
	if (parseInt(this.value) === 0 && parseInt($('#cand').value) < 0)
		$('#cand').value = 0
	if (parseInt(this.value) === 1 && parseInt($('#cand').value) === -2)
		$('#cand').value = -1
	changeVoteData()
})

d3.select('#mode').on('change',function() {
	setMode(parseInt(this.value))
	changeVoteData()
})

d3.select('#type').on('change',function() {
	setCand(parseInt(this.value))
	changeVoteData()
})

d3.select('#cand').on('change',function() {
	if (parseInt(this.value) === -1 && parseInt($('#other').value) === 0)
		$('#other').value = 1
	if (parseInt(this.value) === -2 && parseInt($('#other').value)  <  2)
		$('#other').value = 2
	changeVoteData()
})

drawCounty()
drawTown()

setCand(parseInt($('#type').value))
changeVoteData()
