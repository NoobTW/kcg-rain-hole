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

map = L.map('map').setView(mapCenter, 11);
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
			console.log(type);
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
