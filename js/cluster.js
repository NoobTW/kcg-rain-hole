var map;
var markersAll = {
	before822: [],
	after822: [],
	drops: [],
};
var isOnMap = {
	before822: false,
	after822: false,
	drops: false,
}
var mapData;
var mapCenter = [22.6185024, 120.4086888];
var chart;

map = L.map('map').setView(mapCenter, 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
	maxZoom: 18,
}).addTo(map);

$.getJSON('https://1999.noob.tw/data/kaohsiung.json', (r) => {
	mapData = L.geoJSON(r, {color: '#333', weight: 0.7}).addTo(map);
	if(mapData && zipToStation) showRain();
});

$.getJSON('./Mapping/regMap.json', (r) => {
	zipToStation = r;
	if(mapData && zipToStation) showRain();
});

$.getJSON('./js/822before.json', r => {
	Array.from(r).forEach(m => {
		var marker = new L.Marker([m.lat, m.lng], {
			icon: new L.DivIcon({
				className: 'marker marker-before',
				html: '<span>' + m.clusterId + '</span>',
				iconSize: [20, 20]
			}),
		});
		markersAll.before822.push(marker);
	});
	showMarkers('before822');
});

$.getJSON('./js/822after.json', r => {
	Array.from(r).forEach(m => {
		var marker = new L.Marker([m.lat, m.lng], {
			icon: new L.DivIcon({
				className: 'marker marker-after',
				html: '<span>' + m.clusterId + '</span>',
				iconSize: [20, 20]
			}),
		});
		markersAll.after822.push(marker);
	});
});

$.getJSON('./js/2018_drop.json', r => {
	Array.from(r).forEach(m => {
		var marker = new L.Marker([m.lat, m.lng], {
			icon: new L.DivIcon({
				className: 'marker marker-drop',
				html: '<span></span>',
				iconSize: [5, 5]
			}),
		});
		markersAll.drops.push(marker);
	});
})


function showMarkers(markers){
	if(isOnMap[markers]){
		isOnMap[markers] = false;
		$('#' + markers + ' span').removeClass('active');
	}else{
		isOnMap[markers] = true;
		$('#' + markers + ' span').addClass('active');
	}
	Object.keys(markersAll).forEach(type => {
		if(type === markers){
			Array.from(markersAll[type]).forEach(m => {
				if(isOnMap[markers]) {
					m.addTo(map);
				}else{
					map.removeLayer(m);
				}
			});
		}
	});
}

$('#before822').on('click', () => {
	// $('h1').text('8/22 前坑洞群集')
	showMarkers('before822');
});

$('#after822').on('click', () => {
	// $('h1').text('8/22 後坑洞群集')
	showMarkers('after822');
});

$('#drops').on('click', () => {
	showMarkers('drops');
});

function showRain(){
	var startDate = '2018-08-23 00:00:00';
	var endDate = '2018-08-28 23:59:59';
	var zipName = '全選';

	var zipRain = {};
	var maxRain = Number.MIN_SAFE_INTEGER;
	var minRain = Number.MAX_SAFE_INTEGER;

	mapData.eachLayer(layer => {
		var stationData = zipToStation[layer.feature.properties.T_Name];
		if(stationData){
			$.getJSON('./Mapping/' + stationData + '.json', rain => {
				var count = 0;
				var sum = 0;
				var rainChart = [];
				var dateChart = [];
				var colorsForChart = [];
				Object.keys(rain).forEach(hour => {
					if(moment(hour).unix() >= moment(startDate).unix() && moment(hour).unix() <= moment(endDate).unix()){
						count++;
						sum += parseInt(rain[hour], 10);
						if(zipName === layer.feature.properties.T_Name){
							rainChart.push(parseInt(rain[hour], 10));
							dateChart.push(hour);
							colorsForChart.push('#ff4500');
						}
					}
				});
				if(zipName !== '全選' && dateChart.length){
					if(chart) chart.destroy();
					chart = new Chart($('#chart'), {
						type: 'bar',
						data: {
							labels: dateChart,
							datasets: [{
								label: layer.feature.properties.T_Name + '日雨量',
								data: rainChart,
								backgroundColor: colorsForChart
							}]
						},
						options: {
							maintainAspectRatio: false
						}
					});
				}

				var avgRain = sum / count;
				zipRain[layer.feature.properties.T_Name] = avgRain;
				if(avgRain > maxRain) maxRain = avgRain;
				if(avgRain < minRain) minRain = avgRain;
				// console.log('loading rain:' + Object.keys(zipRain).length + '/' + 36);
				if(Object.keys(zipRain).length === 36){
					mapData.eachLayer(layer => {
						var zip = layer.feature.properties.T_Name;
						var scale = chroma.scale(['white', '#D00000']);
						var color = scale((zipRain[zip] - 1) / 400).hex();
						layer.setStyle({
							fillColor: color,
							fillOpacity: 0.7,
						});
					});

					if(zipName === '全選'){
						if(chart) chart.destroy();

						chart = new Chart($('#chart'), {
							type: 'bar',
							data: {
								labels: Object.keys(zipRain),
								datasets: [{
									label: '高雄市各地區 8/23~8/28 平均日雨量',
									data: Object.values(zipRain),
									backgroundColor: Object.values(zipRain).map(x => '#FF4500')
								}]
							},
							options: {
								maintainAspectRatio: false
							}
						});
					}
				}
			});
		}
	});
}