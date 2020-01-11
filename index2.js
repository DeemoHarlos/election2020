var voteType = ['tsai','han','song','invalid','novote']
var colors = ['#1B9431','#000099','#FF6310','#888888']
var lonmin = 119.34
var lonmax = 122.01
var latmin = 21.86
var latmax = 25.4
var width = lonmax-lonmin
var height = latmax-latmin
var scale = 300
var novotes = false
var invalid = true
var mode = 1
var casei = 0
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

function diffColor(v){ 
	var sc = 1
	if(v>0)return d3.hsl(131,.818,v*.48*sc+.1)+''
	else return d3.hsl(240,1,-v*.5*sc+.1)+''
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

	var arcs = d3.pie().sortValues(null)([0,0,1,0,0]);
	var pie = svg.append('g').attr('class','pie')
	var path = pie.append('g').attr('class','path')
	var text = pie.append('g').attr('class','text')
	for (i in [0,0,1,0,0]){
		path.append('path').attr('class',voteType[i])
			.style('fill', colors[i])
		text.append('text').attr('class',voteType[i])
			.style('fill', 'white')
			.style('font-size','6px')
			.attr('text-anchor','middle')
	}
	pie.selectAll('path').data(arcs)
	pie.selectAll('text').data(arcs)
}

function drawVillage(){
	village.features.forEach((e,i,a)=>{
		var g = svg.append('g')
		           .attr('id',e.properties.VILLAGEID + e.properties.VILLAGENAME)
		           .attr('class','village')
		drawMap(g,e.geometry)
	})
}

function changeVoteData(ci){
	if(mode===0){
		president.county.forEach((e,i,a)=>{
			var v = e.votes
			var county = d3.select('#county'+e.code).data([v])
			var novotenum = e.total - v.tsai - v.han - v.song - v.invalid
			var total = v.tsai+v.han+v.song+v.invalid*(invalid?1:0)+novotenum*(novotes?1:0)
			var diff = (v.tsai-v.han)/total
			county.selectAll('path').style('fill',diffColor(diff))
			console.log(total)
		})
	}
	else if(mode===1){
		president.county.forEach((e,i,a)=>{
			e.town.forEach((te,ti,ta)=>{
				var v = te.votes
				var town = d3.select('#town'+e.code+te.code).data([v])
				var novotenum = te.total - v.tsai - v.han - v.song - v.invalid
				var total = v.tsai+v.han+v.song+v.invalid*(invalid?1:0)+novotenum*(novotes?1:0)
				var diff = (v.tsai-v.han)/total
				town.selectAll('path').style('fill',diffColor(diff))
			})
		})
	}


	var v = president.votes
	var novotenum = president.total - v.tsai - v.han - v.song - v.invalid
	var arcs = d3.pie().sortValues(null)(
		[v.tsai,v.han,v.song,v.invalid*(invalid?1:0),novotenum*(novotes?1:0)]);
	var arctotal = v.tsai+v.han+v.song+v.invalid*(invalid?1:0)+novotenum*(novotes?1:0)
	var path = d3.select('#pie').select('g.pie').selectAll('path')
	var text = d3.select('#pie').select('g.pie').selectAll('text')
	path.data(arcs).attr('d',arc)
	text.data(arcs).text(d=>Math.round(d.value*100/arctotal)+'%')
	text.attr('x',d=>arc.centroid(d)[0]).attr('y',d=>arc.centroid(d)[1]+2)
	if(novotes) $a('text.novote' ).forEach((e,i,a)=>{e.classList.toggle('hide',false)})
	else        $a('text.novote' ).forEach((e,i,a)=>{e.classList.toggle('hide',true )})
	if(invalid) $a('text.invalid').forEach((e,i,a)=>{e.classList.toggle('hide',false)})
	else        $a('text.invalid').forEach((e,i,a)=>{e.classList.toggle('hide',true )})
}

$('#novotes').addEventListener('change',function() {
	if(this.checked) {
		novotes = true
		invalid = true
		$('#invalid').checked = true
	}
	else novotes = false
	changeVoteData(casei)
})

$('#invalid').addEventListener('change',function() {
	if(this.checked) invalid = true
	else {
		invalid = false
		novotes = false
		$('#novotes').checked = false
	}
	changeVoteData(casei)
})

$('#casenum').addEventListener('change',function() {
	casei = parseInt(this.value)
	changeVoteData(casei)
})

$('#mode').addEventListener('change',function() {
	mode = parseInt(this.value)
	if (mode===0){
		d3.selectAll('.county').style('display','initial')
		d3.selectAll('.town'  ).style('display','none')
	}
	else if (mode===1) {
		d3.selectAll('.county').style('display','none')
		d3.selectAll('.town'  ).style('display','initial')
	}
	changeVoteData(casei)
})

drawPie()
drawCounty()
drawTown()
//drawVillage()
if (mode===0){
	d3.selectAll('.county').style('display','initial')
	d3.selectAll('.town'  ).style('display','none')
}
else if (mode===1) {
	d3.selectAll('.county').style('display','none')
	d3.selectAll('.town'  ).style('display','initial')
}

changeVoteData(casei)
