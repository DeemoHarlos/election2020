var voteType = ['tsai','han','song','invalid','novote']
var colors = ['#1B9431','#000099','#FF6310','#888888']
var arc = d3.arc()
	.innerRadius(30)
	.outerRadius(50)
	.cornerRadius(1)
	.padAngle(.01)
var novotes = false
var invalid = true

function draw(i){
	var svg = d3.select('body').select('#president').append('svg')
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
			.style('font-size','3px')
			.attr('text-anchor','middle')
	}
	pie.selectAll('path').data(arcs)
	pie.selectAll('text').data(arcs)
}

function allVote(arr){
	var data = arr.slice()
	var novote = voters - data[0] - data[1] - data[2]
	data.splice(2,0,novote)
	return data
}

function update(){
	var v = president.votes
	var novotenum = president.total - v.tsai - v.han - v.song - v.invalid
	var arcs = d3.pie().sortValues(null)(
		[v.tsai,v.han,v.song,v.invalid*(invalid?1:0),novotenum*(novotes?1:0)]);
	var arctotal = v.tsai+v.han+v.song+v.invalid*(invalid?1:0)+novotenum*(novotes?1:0)
	var path = d3.select('#president').select('g.pie').selectAll('path')
	var text = d3.select('#president').select('g.pie').selectAll('text')
	path.data(arcs).attr('d',arc)
	text.data(arcs).text(d=>Math.round(d.value*1000/arctotal)/10+'%')
	text.attr('x',d=>arc.centroid(d)[0]).attr('y',d=>arc.centroid(d)[1]+2)
	if(novotes) $a('text.novote' ).forEach((e,i,a)=>{e.classList.toggle('hide',false)})
	else        $a('text.novote' ).forEach((e,i,a)=>{e.classList.toggle('hide',true )})
	if(invalid) $a('text.invalid').forEach((e,i,a)=>{e.classList.toggle('hide',false)})
	else        $a('text.invalid').forEach((e,i,a)=>{e.classList.toggle('hide',true )})
}

draw()

$('#novotes').addEventListener('change',function() {
	if(this.checked) {
		novotes = true
		invalid = true
		$('#invalid').checked = true
	}
	else novotes = false
	update()
})

$('#invalid').addEventListener('change',function() {
	if(this.checked) invalid = true
	else {
		invalid = false
		novotes = false
		$('#novotes').checked = false
	}
	update()
})

setTimeout(update,0)