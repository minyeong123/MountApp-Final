"use no memo";

import React, { useEffect, useState, useRef } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Dimensions, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendMessage } from 'react-native-wear-connectivity';

import {
    Footprints, Timer, X, LocateFixed, Play, Pause,
    Mountain, Flame, Heart, MapPin
} from "lucide-react-native";

import { MOUNTAIN_DATA, IMG_BUKHAN_C1 } from "./mountainData";

const { width, height } = Dimensions.get("window");

const BACKEND_URL = "http://10.0.2.2:8082";

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
    const [workoutData, setWorkoutData] = useState({ time: "00:00:00", distance: 0 });
    const [extraMetrics, setExtraMetrics] = useState({ altitude: 0, calories: 0, heartRate: 0 });

    const webViewRef = useRef(null);
    const locationSubscriptionRef = useRef(null);
    const lastLocationRef = useRef(null);
    const distanceRef = useRef(0);
    const isNavigatingRef = useRef(false);
    const isPausedRef = useRef(false);

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
        if (!trail || !trail.path || trail.path.length === 0) return "<html><body></body></html>";
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
                    .pulse-marker { width: 16px; height: 16px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.6); }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    kakao.maps.load(function() {
                        var container = document.getElementById('map');
                        var map = new kakao.maps.Map(container, { center: new kakao.maps.LatLng(${trail.path[0].lat}, ${trail.path[0].lng}), level: 4 });
                        window.mapInstance = map;
                        var linePath = [${trail.path.map(p => `new kakao.maps.LatLng(${p.lat}, ${p.lng})`).join(',')}];
                        new kakao.maps.Polyline({ path: linePath, strokeWeight: 6, strokeColor: '#059669', strokeOpacity: 0.85, map: map });
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
                                window.userMarker = new kakao.maps.CustomOverlay({ position: loc, content: '<div class="pulse-marker"></div>', map: map });
                                if (data.panTo) { map.panTo(loc); }
                            } catch(e) {}
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

    const fetchLatestBiometrics = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            const response = await fetch(`${BACKEND_URL}/api/health/biometrics/latest`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                setExtraMetrics(prev => ({
                    ...prev,
                    heartRate: data.heartRate || prev.heartRate,
                }));
            }
        } catch (error) {
            console.error("서버에서 생체 데이터를 불러오지 못했습니다:", error);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const startTracking = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("권한 거부", "위치 추적을 위해 GPS 권한이 필요합니다.");
                setIsNavigating(false);
                return;
            }
            if (locationSubscriptionRef.current) {
                locationSubscriptionRef.current.remove();
                locationSubscriptionRef.current = null;
            }
            try {
                locationSubscriptionRef.current = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 },
                    (location) => {
                        if (!isMounted || !isNavigatingRef.current || isPausedRef.current) return;
                        const { latitude, longitude, altitude } = location.coords;

                        // 🔥 1. 워치로 현재 폰의 위치(위도, 경도, 고도)를 실시간 전송!12
                        const gpsPayload = JSON.stringify({ lat: latitude, lng: longitude, alt: altitude || 0 });
                        sendMessage({ path: '/gps_data', data: gpsPayload }, () => {}, () => {});

                        webViewRef.current?.postMessage(JSON.stringify({ lat: latitude, lng: longitude, panTo: false }));

                        if (lastLocationRef.current) {
                            const dist = getDistance(lastLocationRef.current.lat, lastLocationRef.current.lng, latitude, longitude);
                            if (dist > 0.005) {
                                const nextDistance = parseFloat((distanceRef.current + dist).toFixed(2));
                                distanceRef.current = nextDistance;

                                setWorkoutData(prev => ({ ...prev, distance: nextDistance }));

                                setExtraMetrics(m => ({
                                    ...m,
                                    altitude: altitude ? Math.round(altitude) : m.altitude,
                                    calories: Math.floor(nextDistance * 75)
                                }));
                                lastLocationRef.current = { lat: latitude, lng: longitude };
                            }
                        } else {
                            lastLocationRef.current = { lat: latitude, lng: longitude };
                            setExtraMetrics(m => ({ ...m, altitude: altitude ? Math.round(altitude) : m.altitude }));
                        }
                    }
                );
            } catch (error) {
                console.error("Tracking Error: ", error);
            }
        };

        if (isNavigating && !isPaused) {
            startTracking();
        } else {
            if (locationSubscriptionRef.current) {
                locationSubscriptionRef.current.remove();
                locationSubscriptionRef.current = null;
            }
        }

        return () => {
            isMounted = false;
            if (locationSubscriptionRef.current) {
                locationSubscriptionRef.current.remove();
                locationSubscriptionRef.current = null;
            }
        };
    }, [isNavigating, isPaused]);

    useEffect(() => {
        let timer = null;
        let dataInterval = null;

        if (isNavigating && !isPaused) {
            timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
            fetchLatestBiometrics();
            dataInterval = setInterval(() => {
                fetchLatestBiometrics();
            }, 2000);
        }

        return () => {
            if (timer) clearInterval(timer);
            if (dataInterval) clearInterval(dataInterval);
        };
    }, [isNavigating, isPaused]);

    useEffect(() => {
        setWorkoutData((prev) => ({ ...prev, time: formatTime(seconds) }));
    }, [seconds]);

    const startNavigation = () => {
        distanceRef.current = 0;
        lastLocationRef.current = null;
        isNavigatingRef.current = true;
        isPausedRef.current = false;
        setIsNavigating(true);
        setIsPaused(false);
        sendMessage({ path: '/workout_control', data: 'start' }, () => {}, () => {});
    };

    const togglePause = () => {
        isPausedRef.current = !isPaused;
        setIsPaused(!isPaused);
        sendMessage({ path: '/workout_control', data: !isPaused ? 'pause' : 'start' }, () => {}, () => {});
    };

    const stopNavigation = () => {
        isNavigatingRef.current = false;
        isPausedRef.current = false;
        setIsNavigating(false);
        setIsPaused(false);
        setSeconds(0);
        distanceRef.current = 0;
        setWorkoutData({ time: "00:00:00", distance: 0 });
        setExtraMetrics({ altitude: 0, calories: 0, heartRate: 0 });
        sendMessage({ path: '/workout_control', data: 'stop' }, () => {}, () => {});
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
                <View className="bg-white px-2.5 py-1 rounded-full border border-gray-100">
                    <Text className="text-xs text-gray-500 font-bold">{trails.length}개</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                {trails.map((trail, index) => (
                    <TouchableOpacity key={trail.id || index} onPress={() => setSelectedTrail(trail)}
                                      className="flex-row bg-white rounded-2xl h-28 overflow-hidden border border-gray-100 mb-3"
                                      activeOpacity={0.7}>
                        <Image source={getTrailImage(trail)} className="w-28 h-full" resizeMode="cover" />
                        <View className="flex-1 p-3 justify-between">
                            <View>
                                <Text className="font-bold text-gray-800 text-sm" numberOfLines={1}>{trail.name}</Text>
                                <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={2}>{trail.description}</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-row items-center gap-1">
                                    <Timer size={13} color="#16a34a" />
                                    <Text className="text-xs text-gray-600 font-semibold">{trail.uptime}</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Footprints size={13} color="#059669" />
                                    <Text className="text-xs text-gray-600 font-semibold">{trail.distance}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal visible={!!selectedTrail} transparent animationType="slide" onRequestClose={() => { setSelectedTrail(null); stopNavigation(); }}>
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-[32px] max-h-[92%] overflow-hidden">
                        <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                            <Text className="font-bold text-gray-900 text-lg">{selectedTrail?.name}</Text>
                            <TouchableOpacity onPress={() => { setSelectedTrail(null); stopNavigation(); }} className="p-1.5 bg-gray-100 rounded-full">
                                <X size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: height * 0.4 }} className="w-full bg-gray-50 relative">
                            {selectedTrail && (
                                <WebView
                                    ref={webViewRef}
                                    originWhitelist={['*']}
                                    source={{ html: generateMapHtml(selectedTrail) }}
                                    className="flex-1"
                                    javaScriptEnabled
                                    domStorageEnabled
                                    mixedContentMode="always"
                                />
                            )}
                            {isNavigating && (
                                <TouchableOpacity onPress={moveToCurrentLocation}
                                                  className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-sm">
                                    <LocateFixed size={20} color="#059669" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="p-6">
                            {!isNavigating ? (
                                <View>
                                    <View className="flex-row gap-3 mb-4">
                                        <View className="flex-1 bg-green-50 p-4 rounded-2xl flex-row items-center gap-3">
                                            <View className="bg-green-700 p-2 rounded-lg">
                                                <Timer size={16} color="white" />
                                            </View>
                                            <View>
                                                <Text className="text-[10px] text-green-700 font-bold">예상 시간</Text>
                                                <Text className="font-bold text-gray-800 text-sm">{selectedTrail?.uptime}</Text>
                                            </View>
                                        </View>
                                        <View className="flex-1 bg-emerald-50 p-4 rounded-2xl flex-row items-center gap-3">
                                            <View className="bg-emerald-700 p-2 rounded-lg">
                                                <Footprints size={16} color="white" />
                                            </View>
                                            <View>
                                                <Text className="text-[10px] text-emerald-700 font-bold">총 거리</Text>
                                                <Text className="font-bold text-gray-800 text-sm">{selectedTrail?.distance}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={startNavigation}
                                                      className="w-full py-4 bg-emerald-950 rounded-xl items-center"
                                                      activeOpacity={0.8}>
                                        <Text className="text-white font-bold text-base">운동 시작</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View className="gap-4">
                                    <View className="flex-row gap-3">
                                        <View className="flex-1 bg-emerald-900 p-4 rounded-2xl">
                                            <Text className="text-[10px] text-emerald-300 font-bold mb-1">⏱️ 운동 시간</Text>
                                            <Text className="text-2xl font-black text-white">{workoutData.time}</Text>
                                        </View>
                                        <View className="flex-1 bg-white border-2 border-emerald-900 p-4 rounded-2xl">
                                            <Text className="text-[10px] text-gray-400 font-bold mb-1">👣 이동 거리</Text>
                                            <Text className="text-2xl font-black text-emerald-900">{workoutData.distance}<Text className="text-xs text-gray-400">km</Text></Text>
                                        </View>
                                    </View>

                                    <View className="flex-row justify-between">
                                        {[
                                            { icon: <Mountain size={14} color="#3b82f6" />, label: '고도', value: `${extraMetrics.altitude}m` },
                                            { icon: <Flame size={14} color="#f97316" />, label: '칼로리', value: `${extraMetrics.calories}kcal` },
                                            { icon: <Heart size={14} color="#ef4444" />, label: '심박수', value: `${extraMetrics.heartRate}bpm` },
                                            { icon: <MapPin size={14} color="#10b981" />, label: '남은거리', value: `${Math.max(0, (parseDistanceNumber(selectedTrail?.distance) - workoutData.distance)).toFixed(1)}km` },
                                        ].map((item, i) => (
                                            <View key={i} className="flex-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100 items-center mx-1">
                                                {item.icon}
                                                <Text className="text-[9px] text-gray-400 font-bold mt-1">{item.label}</Text>
                                                <Text className="text-xs font-bold text-gray-800 mt-0.5">{item.value}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <View className="flex-row gap-3 mt-2">
                                        <TouchableOpacity onPress={togglePause}
                                                          className={`flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2 ${isPaused ? 'bg-amber-500' : 'bg-gray-100'}`}
                                                          activeOpacity={0.8}>
                                            {isPaused
                                                ? <><Play size={18} color="white" /><Text className="text-white font-bold">재시작</Text></>
                                                : <><Pause size={18} color="#6b7280" /><Text className="text-gray-500 font-bold">일시정지</Text></>
                                            }
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={stopNavigation}
                                                          className="flex-[1.5] py-4 bg-red-500 rounded-xl items-center justify-center"
                                                          activeOpacity={0.8}>
                                            <Text className="text-white font-bold">운동 종료</Text>
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