var map;
var markersAll = {
	before822: [],
	after822: [],
};
var mapData;
var mapCenter = [22.9185024, 120.5786888];

map = L.map('map').setView(mapCenter, 9);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
	maxZoom: 18,
}).addTo(map);

$.getJSON('https://1999.noob.tw/data/kaohsiung.json', (r) => {
	mapData = L.geoJSON(r, {color: '#333', weight: 0.7}).addTo(map);
});

$.getJSON('./js/822before.json', r => {
	Array.from(r).forEach(m => {
		var marker = new L.Marker([m.lat, m.lng], {
			icon: new L.DivIcon({
				className: 'marker marker-before',
				html: '<span>' + m.clusterId + '</span>',
				iconSize: [20, 20]
			}),
			iconSize: [40, 40]
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
			iconSize: [40, 40]
		});
		markersAll.after822.push(marker);
	});
});


function showMarkers(markers){
	// console.log(markers)
	Object.keys(markersAll).forEach(type => {
		// console.log(type)
		if(type === markers){
			console.log(type);
			Array.from(markersAll[type]).forEach(m => {
				m.addTo(map);
			});
		}else{
			Array.from(markersAll[type]).forEach(m => {
				map.removeLayer(m);
			});
		}
	})
}

$('#before822').on('click', () => {
	$('h1').text('8/22 前坑洞群集')
	showMarkers('before822');
});

$('#after822').on('click', () => {
	$('h1').text('8/22 後坑洞群集')
	showMarkers('after822');
});