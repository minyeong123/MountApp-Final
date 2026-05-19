import React, { useEffect, useState, useRef } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Dimensions, Alert, Platform } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import {
    Footprints, Timer, X, LocateFixed, Play, Pause,
    Mountain, Flame, Heart, MapPin
} from "lucide-react-native";

import { MOUNTAIN_DATA, IMG_BUKHAN_C1 } from "./mountainData";

const { width, height } = Dimensions.get("window");

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function MountainCourse({ id }) {
    const [selectedTrail, setSelectedTrail] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [isWebViewReady, setIsWebViewReady] = useState(false); // ✨ 웹뷰 로딩 체크 상태 추가

    const [workoutData, setWorkoutData] = useState({ time: "00:00:00", distance: 0 });
    const [extraMetrics, setExtraMetrics] = useState({ altitude: 0, calories: 0, heartRate: 0 });

    const webViewRef = useRef(null);
    const locationSubscriptionRef = useRef(null);
    const lastLocationRef = useRef(null);
    const distanceRef = useRef(0);

    const trails = MOUNTAIN_DATA[id] || [];

    const getTrailImage = (trail) => {
        if (trail.imageSource) return trail.imageSource;
        if (trail.imageUrl) return { uri: trail.imageUrl };
        return IMG_BUKHAN_C1;
    };

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const parseDistanceNumber = (distStr) => {
        if (!distStr) return 0;
        const match = String(distStr).match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    };

    const generateMapHtml = (trail) => {
        if (!trail || !trail.path || trail.path.length === 0) return "";
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
                <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=9c3cba91e55b9235299a3d7119d22830&autoload=false"></script>
                <style>
                    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background-color: #f3f4f6; }
                    .label { padding: 4px 10px; background: #10b981; color: white; border-radius: 12px; font-size: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                    .label.end { background: #ef4444; }
                    .pulse-container { position: relative; width: 16px; height: 16px; }
                    .pulse-marker { width: 16px; height: 16px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.6); position: absolute; z-index: 2; }
                    .pulse-wave { position: absolute; top: 0; left: 0; width: 16px; height: 16px; background: #3b82f6; border-radius: 50%; opacity: 0.4; animation: pulse-animation 2s infinite; z-index: 1; }
                    @keyframes pulse-animation {
                        0% { transform: scale(1); opacity: 0.4; }
                        100% { transform: scale(3); opacity: 0; }
                    }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    kakao.maps.load(function() {
                        var container = document.getElementById('map');
                        var options = {
                            center: new kakao.maps.LatLng(${trail.path[0].lat}, ${trail.path[0].lng}),
                            level: 4
                        };
                        var map = new kakao.maps.Map(container, options);
                        window.mapInstance = map;

                        var linePath = [
                            ${trail.path.map(p => `new kakao.maps.LatLng(${p.lat}, ${p.lng})`).join(',')}
                        ];
                        var polyline = new kakao.maps.Polyline({
                            path: linePath, strokeWeight: 6, strokeColor: '#059669', strokeOpacity: 0.85, map: map
                        });

                        new kakao.maps.CustomOverlay({ position: linePath[0], content: '<div class="label">출발</div>', yAnchor: 2.5, map: map });
                        new kakao.maps.CustomOverlay({ position: linePath[linePath.length - 1], content: '<div class="label end">도착</div>', yAnchor: 2.5, map: map });

                        var bounds = new kakao.maps.LatLngBounds();
                        linePath.forEach(function(p) { bounds.extend(p); });
                        map.setBounds(bounds);

                        window.userMarker = null;
                        
                        var handleMessage = function(event) {
                            try {
                                var data = JSON.parse(event.data);
                                var loc = new kakao.maps.LatLng(data.lat, data.lng);
                                if (window.userMarker) { window.userMarker.setMap(null); }
                                
                                var markerContent = '<div class="pulse-container"><div class="pulse-marker"></div><div class="pulse-wave"></div></div>';
                                window.userMarker = new kakao.maps.CustomOverlay({ position: loc, content: markerContent, map: map, xAnchor: 0.5, yAnchor: 0.5 });
                                
                                if (data.panTo) { map.panTo(loc); }
                            } catch(e) { console.error(e); }
                        };
                        
                        document.addEventListener("message", handleMessage);
                        window.addEventListener("message", handleMessage);
                    });
                </script>
            </body>
            </html>
        `;
    };

    const moveToCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        webViewRef.current?.postMessage(JSON.stringify({ lat: loc.coords.latitude, lng: loc.coords.longitude, panTo: true }));
    };

    useEffect(() => {
        let isMounted = true;
        let sub = null;

        const startTracking = async () => {
            // ✨ 추가 보완: 웹뷰 준비가 안 끝났으면 트래킹 시작을 잠시 대기
            if (!isWebViewReady) return;

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("권한 거부", "위치 추적을 위해 GPS 권한이 필요합니다.");
                setIsNavigating(false);
                return;
            }

            try {
                if (locationSubscriptionRef.current) {
                    locationSubscriptionRef.current.remove();
                    locationSubscriptionRef.current = null;
                }

                sub = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        distanceInterval: 3,
                        timeInterval: 2000
                    },
                    (location) => {
                        if (!isMounted || !isNavigating || isPaused) return;
                        if (!location || !location.coords) return;

                        const { latitude, longitude, altitude } = location.coords;

                        webViewRef.current?.postMessage(JSON.stringify({ lat: latitude, lng: longitude, panTo: true }));

                        if (lastLocationRef.current) {
                            const dist = getDistance(lastLocationRef.current.lat, lastLocationRef.current.lng, latitude, longitude);

                            if (dist > 0.005) {
                                const nextDistance = parseFloat((distanceRef.current + dist).toFixed(2));
                                distanceRef.current = nextDistance;

                                setWorkoutData(prev => ({ ...prev, distance: nextDistance }));
                                setExtraMetrics(m => ({
                                    ...m,
                                    altitude: altitude ? Math.round(altitude) : m.altitude,
                                    calories: Math.floor(nextDistance * 75),
                                    heartRate: Math.floor(Math.random() * (145 - 120) + 120)
                                }));
                                lastLocationRef.current = { lat: latitude, lng: longitude };
                            }
                        } else {
                            lastLocationRef.current = { lat: latitude, lng: longitude };
                            setExtraMetrics(m => ({ ...m, altitude: altitude ? Math.round(altitude) : m.altitude }));
                        }
                    }
                );

                if (isMounted) {
                    locationSubscriptionRef.current = sub;
                } else {
                    sub.remove();
                }

            } catch (error) {
                console.log("GPS 기기 연동 예외 처리:", error);
            }
        };

        if (isNavigating && !isPaused) {
            startTracking();
        }

        return () => {
            isMounted = false;
            if (locationSubscriptionRef.current) {
                locationSubscriptionRef.current.remove();
                locationSubscriptionRef.current = null;
            }
            if (sub) {
                sub.remove();
            }
        };
    }, [isNavigating, isPaused, isWebViewReady]); // ✨ 의존성 배열에 isWebViewReady 추가

    useEffect(() => {
        let timer = null;
        if (isNavigating && !isPaused) {
            timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isNavigating, isPaused]);

    useEffect(() => {
        setWorkoutData((prev) => ({ ...prev, time: formatTime(seconds) }));
    }, [seconds]);

    const startNavigation = () => {
        distanceRef.current = 0;
        lastLocationRef.current = null;
        setIsNavigating(true);
        setIsPaused(false);
    };

    const togglePause = () => setIsPaused(!isPaused);

    const stopNavigation = () => {
        setIsNavigating(false);
        setIsPaused(false);
        setSeconds(0);
        distanceRef.current = 0;
        setWorkoutData({ time: "00:00:00", distance: 0 });
        setExtraMetrics({ altitude: 0, calories: 0, heartRate: 0 });
        lastLocationRef.current = null;
        if (locationSubscriptionRef.current) {
            locationSubscriptionRef.current.remove();
            locationSubscriptionRef.current = null;
        }
    };

    return (
        <View className="flex-1 bg-white px-4 pt-4">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-900">추천 탐방 코스</Text>
                <View className="bg-white px-2.5 py-1 rounded-full border border-gray-100 shadow-sm">
                    <Text className="text-xs text-gray-500 font-bold">{trails.length}개</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                {trails.map((trail, index) => (
                    <TouchableOpacity key={trail.id || index} onPress={() => { setSelectedTrail(trail); setIsWebViewReady(false); }} className="flex-row bg-white rounded-2xl h-28 overflow-hidden border border-gray-100 mb-3 shadow-sm" activeOpacity={0.7}>
                        <Image
                            source={getTrailImage(trail)}
                            style={{ width: 112, height: '100%' }}
                            className="bg-gray-200"
                            resizeMode="cover"
                        />
                        <View className="flex-1 p-3 justify-between">
                            <View>
                                <Text className="font-bold text-gray-800 text-sm" numberOfLines={1}>{trail.name}</Text>
                                <Text className="text-xs text-gray-500 mt-0.5 leading-4" numberOfLines={2}>{trail.description}</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-row items-center gap-1"><Timer size={13} color="#16a34a" /><Text className="text-[11px] text-gray-600 font-semibold">{trail.uptime}</Text></View>
                                <View className="flex-row items-center gap-1"><Footprints size={13} color="#059669" /><Text className="text-[11px] text-gray-600 font-semibold">{trail.distance}</Text></View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal
                visible={!!selectedTrail}
                transparent
                animationType="slide"
                onRequestClose={() => { setSelectedTrail(null); stopNavigation(); }}
            >
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-[32px] h-[88%] overflow-hidden flex-col">

                        <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                            <Text className="font-bold text-gray-900 text-lg flex-1 mr-2" numberOfLines={1}>
                                {selectedTrail?.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => { setSelectedTrail(null); stopNavigation(); }}
                                className="p-1.5 bg-gray-100 rounded-full"
                            >
                                <X size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {/* 💡 WebView의 고정 컨테이너 */}
                        <View className="w-full h-[38%] bg-gray-50 relative">
                            {selectedTrail && (
                                <WebView
                                    ref={webViewRef}
                                    originWhitelist={['*']}
                                    source={{ html: generateMapHtml(selectedTrail) }}
                                    style={{ flex: 1 }}
                                    javaScriptEnabled
                                    domStorageEnabled
                                    mixedContentMode="always"
                                    onLoadEnd={() => setIsWebViewReady(true)} // ✨ 로딩 완료 시 시그널 제공
                                />
                            )}
                            {isNavigating && (
                                <TouchableOpacity
                                    onPress={moveToCurrentLocation}
                                    className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg"
                                    style={{ elevation: 4 }}
                                >
                                    <LocateFixed size={20} color="#059669" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="flex-1 p-5 justify-between bg-white">
                            {!isNavigating ? (
                                <View className="flex-1 justify-between">
                                    <View className="flex-row gap-3">
                                        <View className="flex-1 bg-green-50 p-4 rounded-2xl flex-row items-center gap-3">
                                            <View className="bg-green-700 p-2 rounded-lg"><Timer size={16} color="white" /></View>
                                            <View>
                                                <Text className="text-[10px] text-green-700 font-bold uppercase">예상 시간</Text>
                                                <Text className="font-bold text-gray-800 text-sm">{selectedTrail?.uptime}</Text>
                                            </View>
                                        </View>
                                        <View className="flex-1 bg-emerald-50 p-4 rounded-2xl flex-row items-center gap-3">
                                            <View className="bg-emerald-700 p-2 rounded-lg"><Footprints size={16} color="white" /></View>
                                            <View>
                                                <Text className="text-[10px] text-emerald-700 font-bold uppercase">총 거리</Text>
                                                <Text className="font-bold text-gray-800 text-sm">{selectedTrail?.distance}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={startNavigation}
                                        className="w-full py-4 bg-emerald-950 rounded-xl items-center shadow-md mb-2"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="color-white font-bold text-base">길 찾기 시작</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View className="flex-1 justify-between">
                                    <View className="flex-row gap-3">
                                        <View className="flex-1 bg-emerald-900 p-3.5 rounded-2xl shadow-sm">
                                            <Text className="text-[10px] text-emerald-300 font-bold uppercase mb-1">⏱️ 운동 시간</Text>
                                            <Text className="text-lg font-black color-white">{workoutData.time}</Text>
                                        </View>
                                        <View className="flex-1 bg-white border-2 border-emerald-900 p-3.5 rounded-2xl">
                                            <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1">👣 이동 거리</Text>
                                            <Text className="text-lg font-black color-emerald-900">{workoutData.distance}<Text className="text-xs text-gray-400 ml-0.5 font-medium">km</Text></Text>
                                        </View>
                                    </View>

                                    <View className="flex-row justify-between my-2">
                                        <View className="flex-1 bg-gray-50 p-2 rounded-xl border border-gray-100 items-center mx-0.5">
                                            <Mountain size={14} color="#3b82f6" /><Text className="text-[9px] text-gray-400 font-bold uppercase mt-1">고도</Text>
                                            <Text className="text-[11px] font-bold text-gray-800 mt-0.5">{extraMetrics.altitude}m</Text>
                                        </View>
                                        <View className="flex-1 bg-gray-50 p-2 rounded-xl border border-gray-100 items-center mx-0.5">
                                            <Flame size={14} color="#f97316" /><Text className="text-[9px] text-gray-400 font-bold uppercase mt-1">칼로리</Text>
                                            <Text className="text-[11px] font-bold text-gray-800 mt-0.5">{extraMetrics.calories}kcal</Text>
                                        </View>
                                        <View className="flex-1 bg-gray-50 p-2 rounded-xl border border-gray-100 items-center mx-0.5">
                                            <Heart size={14} color="#ef4444" /><Text className="text-[9px] text-gray-400 font-bold uppercase mt-1">심박수</Text>
                                            <Text className="text-[11px] font-bold text-gray-800 mt-0.5">{extraMetrics.heartRate}bpm</Text>
                                        </View>
                                        <View className="flex-1 bg-gray-50 p-2 rounded-xl border border-gray-100 items-center mx-0.5">
                                            <MapPin size={14} color="#10b981" /><Text className="text-[9px] text-gray-400 font-bold uppercase mt-1">남은거리</Text>
                                            <Text className="text-[11px] font-bold text-gray-800 mt-0.5">
                                                {Math.max(0, (parseDistanceNumber(selectedTrail?.distance) - workoutData.distance)).toFixed(1)}km
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            onPress={togglePause}
                                            className={`flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2 ${isPaused ? 'bg-amber-500' : 'bg-gray-100'}`}
                                            activeOpacity={0.8}
                                        >
                                            {isPaused ? <><Play size={18} color="white" /><Text className="color-white font-bold">재시작</Text></> : <><Pause size={18} color="#6b7280" /><Text className="color-gray-500 font-bold">일시정지</Text></>}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={stopNavigation}
                                            className="flex-[1.5] py-4 bg-red-500 rounded-xl items-center justify-center shadow-sm"
                                            activeOpacity={0.8}
                                        >
                                            <Text className="color-white font-bold">운동 종료</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>

                    </View>
                </View>
            </Modal>
        </View>
    );
}