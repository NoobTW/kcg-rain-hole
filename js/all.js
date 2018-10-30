var map;
var markers = [];
var mapData;

// 宣告 map
map = L.map('map').setView([22.9185024, 120.5786888], 9);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
	maxZoom: 18,
}).addTo(map);

// 讀取資料，存在 markers[] 裡面
$.getJSON('./js/final.json', function(data){
	Array.from(data).forEach(event => {
		if(event.lat !== 'NULL'){
			var marker = L.marker([event.lat, event.lng], {
				icon: L.icon({
					iconUrl: 'http://1999.noob.tw/image/lightbulb.png',
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
$.getJSON('https://1999.noob.tw/data/kaohsiung.json', function(r){
	mapData = L.geoJSON(r, {color: '#333', weight: 0.7}).addTo(map);
});

// 顯示 marker
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

$('#go').on('click', () => {
	showMarker();
});
