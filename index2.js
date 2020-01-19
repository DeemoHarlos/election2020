var lonmin = 119.34
var lonmax = 122.01
var latmin = 21.86
var latmax = 25.4
var width = lonmax-lonmin
var height = latmax-latmin
var scale = 300

var colors = {
	president: ['#FF6310','#000099','#1B9431'],
	invalid: '#888888',
	novote: '#333333'
}

var typeKey = ['president']

var x = d3.scaleLinear().range([0,width*scale] ).domain([lonmin,lonmax])
var y = d3.scaleLinear().range([height*scale,0]).domain([latmin,latmax])
var svg = d3.select('#map').append('svg')
            .attr('width', width*scale)
            .attr('height', height*scale)
var arc = d3.arc()
	.innerRadius(30)
	.outerRadius(50)
	.cornerRadius(1)
	.padAngle(.01)

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

function setColor(value, t, c){
	var sc = 1
	var color
	if (c === 0) {
		var color1 = d3.hsl(colors[typeKey[t]][2])
		var color2 = d3.hsl(colors[typeKey[t]][1])
		if (value > 0) return d3.hsl(color1.h, color1.s,  value * .45 * sc + .05) + ''
		else           return d3.hsl(color2.h, color2.s, -value * .45 * sc + .05) + ''
	}
	if (c === -1) color = d3.hsl(colors.invalid)
	if (c === -2) color = d3.hsl(colors.novote)
	if (c  >  0 ) color = d3.hsl(colors[typeKey[t]][c-1])
	return d3.hsl(color.h, color.s, value * .45 * sc + .05) + ''
}

function drawCounty(){
	county.features.forEach((e,i,a)=>{
		var g = svg.append('g')
		           .attr('id','county' + e.properties.COUNTYCODE)
		           .attr('class','county')
		drawMap(g,e.geometry)
	})
	d3.select('#county09007').attr('transform','translate(100,320)')
	d3.select('#county09020').attr('transform','translate(400,0)')
	d3.select('#county09020').select('path:nth-last-child(1)')
	                         .attr('transform','translate(-250,100)')
	d3.select('#county09020').select('path:nth-last-child(2)')
	                         .attr('transform','translate(-250,100)')
}

function drawTown(){
	town.features.forEach((e,i,a)=>{
		var g = svg.append('g')
		           .attr('id','town' + e.properties.TOWNCODE.slice(0,7))
		           .attr('class','town county' + e.properties.TOWNCODE.slice(0,5))
		drawMap(g,e.geometry)
	})
	d3.selectAll('.county09007').attr('transform','translate(100,320)')
	d3.selectAll('.county09020').attr('transform','translate(400,0)')
	d3.select('#town0902006').attr('transform','translate(150,100)')
}

function drawPie(){
	var svg = d3.select('body').select('#pie').append('svg')
		.attr('width', '100%')
		.attr('height', '100%')
		.attr('viewBox', '-50 -50 100 100')

	var pie = svg.append('g').attr('class','pie')
	var path = pie.append('g').attr('class','path')
	var text = pie.append('g').attr('class','text')
		.style('fill', 'white')
		.style('font-size','6px')
		.attr('text-anchor','middle')
}
/*
function drawVillage(){
	village.features.forEach((e,i,a)=>{
		var g = svg.append('g')
		           .attr('id',e.properties.VILLAGEID + e.properties.VILLAGENAME)
		           .attr('class','village')
		drawMap(g,e.geometry)
	})
}
*/
function arraySum(arr) {
	var total = 0
	arr.forEach((e,i,a)=>{ total += e })
	return total
}

function getValue(v, c, o) {
	var total = arraySum(v.votes)
	if (o > 0) total += v.invalid
	if (o > 1) total += v.novote
	if (c === 0 ) return (v.votes[2] - v.votes[1]) / total
	if (c === -1) return v.invalid / total
	if (c === -2) return 1 - v.novote / total
	if (c  >  0 ) return v.votes[c-1] / total
	return 0
}

function changeVoteData(){
	var m = parseInt($('#mode' ).value)
	var t = parseInt($('#type' ).value)
	var c = parseInt($('#cand' ).value)
	var o = parseInt($('#other').value)

	if (m) {
		data.county.forEach((e,i,a)=>{
			e.town.forEach((te,ti,ta)=>{
				var v = te[typeKey[t]]
				var value = getValue(v, c, o)
				var town = d3.select('#town'+e.code+te.code).data([v])
				town.selectAll('path').style('fill',setColor(value, t, c))
			})
		})
	} else {
		data.county.forEach((e,i,a)=>{
			var v = e[typeKey[t]]
			var value = getValue(v, c, o)
			var county = d3.select('#county'+e.code).data([v])
			county.selectAll('path').style('fill',setColor(value, t, c))
		})
	}

	var v = data[typeKey[t]]
	var arr = []
	var path = d3.select('#pie').select('g.path')
	var text = d3.select('#pie').select('g.text')
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

	path.selectAll('path').data(arcs).attr('d',arc)
	text.selectAll('text').data(arcs)
		.attr('x',d=>arc.centroid(d)[0]).attr('y',d=>arc.centroid(d)[1]+2)
		.text(d=>Math.round(d.value*1000/total)/10+'%')
}

function setMode(m) {
	if (m) {
		d3.selectAll('.county').style('display','none')
		d3.selectAll('.town'  ).style('display','initial')
	} else {
		d3.selectAll('.county').style('display','initial')
		d3.selectAll('.town'  ).style('display','none')
	}
}

function setCand(t) {
	var c = parseInt($('#cand').value)
	var candidate = d3.select('#cand')
	candidate.selectAll('option').remove()
	candidate.append('option').text('預設').attr('value', 0)
	data[typeKey[t]].info.forEach((e,i,a)=>{
		candidate.append('option').text(e.index + '. ' + e.name).attr('value', e.index)
	})
	candidate.append('option').text('廢票').attr('value', -1)
	candidate.append('option').text('投票率').attr('value', -2)
	if (c > 0) $('#cand').value = 0
	else $('#cand').value = c
}

$('#other').addEventListener('change',function() {
	changeVoteData()
})

$('#mode').addEventListener('change',function() {
	setMode(parseInt(this.value))
	changeVoteData()
})

$('#type').addEventListener('change',function() {
	setCand(parseInt(this.value))
	changeVoteData()
})

$('#cand').addEventListener('change',function() {
	if (parseInt(this.value) === -1 && parseInt($('#other').value) === 0)
		$('#other').value = 1
	if (parseInt(this.value) === -2 && parseInt($('#other').value)  <  2)
		$('#other').value = 2
	changeVoteData()
})

drawPie()
drawCounty()
drawTown()
//drawVillage()

setCand(parseInt($('#type').value))
changeVoteData()
