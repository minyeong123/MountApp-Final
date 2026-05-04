export const getKakaoMapHtml = (apiKey) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false"></script>
        <style>
            body, html, #map { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
            /* 웹에서 사용하신 커스텀 오버레이 스타일 */
            .custom-overlay { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
            .badge { 
                background: white; padding: 4px 10px; border-radius: 20px; 
                font-size: 11px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
                margin-bottom: 4px; border: 1px solid #ddd; white-space: nowrap; 
            }
            .pin { 
                width: 16px; height: 16px; background: #FF0033; border-radius: 50% 50% 50% 0; 
                transform: rotate(-45deg); border: 2px solid white; box-shadow: 1px 1px 3px rgba(0,0,0,0.3); 
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map;
            var overlays = [];

            kakao.maps.load(function() {
                var container = document.getElementById('map');
                var options = { center: new kakao.maps.LatLng(36.2683, 127.6358), level: 12 };
                map = new kakao.maps.Map(container, options);

                document.addEventListener("message", handleMessage);
                window.addEventListener("message", handleMessage);
            });

            function handleMessage(event) {
                var data = JSON.parse(event.data);
                if (data.type === 'INIT_MAP') {
                    initCustomOverlays(data.mountains);
                } else if (data.type === 'PAN_TO') {
                    map.panTo(new kakao.maps.LatLng(data.lat, data.lng));
                    map.setLevel(6);
                }
            }

            function initCustomOverlays(mountains) {
                overlays.forEach(o => o.setMap(null));
                overlays = [];

                const targetNames = ["북한산", "설악산", "한라산", "지리산", "내장산"];

                mountains.forEach(function(m) {
                    var name = m.NAME || m.name;
                    var lat = m.LAT || m.lat;
                    var lng = m.LON || m.lon;
                    var id = m.ID || m.id;

                    if (!name || !lat || !lng || !targetNames.includes(name)) return;

                    var content = document.createElement('div');
                    content.className = 'custom-overlay';
                    content.innerHTML = '<div class="badge">' + name + '</div><div class="pin"></div>';
                    
                    // 터치 이벤트 발생 시 React Native로 데이터 전송
                    content.onclick = function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'MARKER_CLICK',
                            id: id
                        }));
                    };

                    var overlay = new kakao.maps.CustomOverlay({
                        position: new kakao.maps.LatLng(lat, lng),
                        content: content,
                        yAnchor: 1.25
                    });

                    overlay.setMap(map);
                    overlays.push(overlay);
                });
            }
        </script>
    </body>
    </html>
    `;
};