const formato = {year: 'numeric', month: 'long', day: 'numeric'};


function draw(data, columna) {
	var svgWidth = 600;
	var svgHeight = 480;
	var margin = {top: 20, right: 20, bottom: 30, left: 50};
	var width = svgWidth - margin.left - margin.right;
	var height = svgHeight - margin.top - margin.bottom;
	var svg = d3.select("#dataviz")
		.append("svg")
  		.attr("preserveAspectRatio", "xMinYMin meet")
  		.attr("viewBox", "0 0 600 480")
		.append("g")
		.attr("transform", 
			"translate(" + margin.left + "," + margin.top + ")" );


	var x = d3.scaleTime()
		.domain(d3.extent(data, function(d) { return d.fecha; }))
		.range([0, width]);
	
	var max_y1 = d3.max(data, function(d) { return d[columna]; });

	var y = d3.scaleLinear()
		.domain([0, max_y1])
		.range([height, 0]);

	var line = d3.line()
		.x(function(d) {
			return x(d.fecha);
		})
		.y(function(d) {
			return y(d[columna]);
		});

	var line2 = d3.line()
		.x(function(d) {
			return x(d.fecha);
		})
		.y(function(d) {
			return y(d[columna]);
		});

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	svg.append("g")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("fill", "#000")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("Total de " + columna);


	var tooltip = d3.select("#dataviz")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "1px")
		.style("border-radius", "5px")
		.style("padding","10px")

	//DATOS SIN CUARENTENA
	svg.selectAll("dot")
		.data(data)
		.enter().append("circle")
		.attr("r", 5)
		.attr("cx", function(d) { return x(d.fecha); })
		.attr("cy", function(d) { return y(d[columna]); })
		.on("mouseover", function(c) {
			tooltip.style("opacity", 1)
				.html(c[columna] + " " + columna + " al día " + c.fecha.toLocaleDateString('es-CL', formato));
			svg.select('[cx="'+ x(c.fecha) + '"]')
				.style("fill", "red");
		})
		.on("mouseout", function(c) {
			tooltip.transition()
				.duration(200)
				.style("opacity", 0);
			svg.select('[cx="'+ x(c.fecha) + '"]')
				.style("fill", "black");
		});

	svg.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", line);

}

var app = new Vue({
	el: '#pro',
	data: {
		actual: 0,
		fecha: "",
		porcentaje: 0,
	},
	created() {
		let este = this;
		var csv = d3.csv("https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto1/Covid-19.csv").then(
			function(d) {
				return d[109];
			}
		);

		csv.then(function(da) {
			delete da["Comuna"];
			delete da["Codigo comuna"];
			delete da["Codigo region"];
			var pobl = Number(da["Poblacion"]);
			delete da["Poblacion"];
			delete da["Region"];
			delete da["Tasa"];
			objecto = [];
			var fechas = Object.keys(da);
			var contagiados = Object.values(da);
			var objetos = []
                        for(var i = 0; i < fechas.length; i++) {
				o = {
					"fecha": d3.timeParse("%Y-%m-%d")(fechas[i]),
					"contagiados": Number(contagiados[i])
				};
                                objetos.push(o);
                        }
			var ultimo = objetos[objetos.length - 1];
			este.actual = ultimo.contagiados;
			este.fecha = ultimo.fecha.toLocaleDateString('es-CL', formato);
			este.porcentaje = Number((ultimo.contagiados * 100) / pobl).toFixed(2);
			console.log(pobl);
			draw(objetos, "contagiados");
		});
	},
});
