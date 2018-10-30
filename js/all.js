var map;
var markers = []; // 坑洞 marker
var mapData; // GeoJSON 邊界資料
var zipToStation = {} // 行政區與測站對應資料
var chart;

// 宣告 map
map = L.map('map').setView([22.9185024, 120.5786888], 9);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
	maxZoom: 18,
}).addTo(map);

// 讀取資料，存在 markers[] 裡面
$.getJSON('./js/final.json', (data) => {
	Array.from(data).forEach(event => {
		if(event.lat !== 'NULL'){
			var marker = L.marker([event.lat, event.lng], {
				icon: L.icon({
					iconUrl: 'https://1999.noob.tw/image/lightbulb.png',
				}),
			});
			marker.lat = event.lat;
			marker.lng = event.lng;
			marker.fileNo = event.fileNo;
			marker.cre_Date = event.cre_Date;
			marker.zipName = event.zipName;
			markers.push(marker);
		}
	});
	showMarker();
});

// 讀取行政區邊界
$.getJSON('https://1999.noob.tw/data/kaohsiung.json', (r) => {
	mapData = L.geoJSON(r, {color: '#333', weight: 0.7}).addTo(map);
	if(mapData && zipToStation) showRain();
});

// 讀取行政區測站對應資料
$.getJSON('./Mapping/regMap.json', (r) => {
	zipToStation = r;
	if(mapData && zipToStation) showRain();
});

// 顯示坑洞 marker
function showMarker(){
	var startDate = $('#start').val() + ' 00:00:00';
	var endDate = $('#end').val() + ' 23:59:59';
	var zipName = $('#zipName').val();

	Array.from(markers).forEach(m => {
		var timestamp = moment(m.cre_Date).unix();
		if(zipName === '全選'){
			if(timestamp >= moment(startDate).unix() && timestamp <= moment(endDate).unix()){
				m.addTo(map);
			}else{
				map.removeLayer(m);
			}
		}else{
			if(timestamp >= moment(startDate).unix() && timestamp <= moment(endDate).unix() && m.zipName === zipName){
				m.addTo(map);
			}else{
				map.removeLayer(m);
			}
		}
	});
}

// 顯示雨量
function showRain(){
	var startDate = $('#start').val() + ' 00:00:00';
	var endDate = $('#end').val() + ' 23:59:59';
	var zipName = $('#zipName').val();

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
				Object.keys(rain).forEach(hour => {
					if(moment(hour).unix() >= moment(startDate).unix() && moment(hour).unix() <= moment(endDate).unix()){
						count++;
						sum += parseInt(rain[hour], 10);
						if(zipName === layer.feature.properties.T_Name){
							rainChart.push(parseInt(rain[hour], 10));
							dateChart.push(hour);
						}
					}
				});
				if(zipName !== '全選' && dateChart.length){
					if(chart) chart.destroy();
					console.log(dateChart);
					chart = new Chart($('#chart'), {
						type: 'bar',
						data: {
							labels: dateChart,
							datasets: [{
								label: 'rains',
								data: rainChart,
							}]
						}
					});
				}

				var avgRain = sum / count;
				zipRain[layer.feature.properties.T_Name] = avgRain;
				if(avgRain > maxRain) maxRain = avgRain;
				if(avgRain < minRain) minRain = avgRain;
				console.log('loading rain:' + Object.keys(zipRain).length + '/' + 36);
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
				}
			});
		}
	});
}

$('#go').on('click', () => {
	showMarker();
	showRain();
});
