import React, { useEffect, useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { Search, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { getKakaoMapHtml } from "./KakaoMapHtml";

const API_BASE_URL = "http://10.0.2.2:8082"; // 에뮬레이터 환경

export default function Map() {
    const router = useRouter();
    const webViewRef = useRef(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [mountains, setMountains] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMountains = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/mountains`);
                setMountains(res.data);
            } catch (error) {
                console.error("데이터 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMountains();
    }, []);

    const handleSearch = () => {
        const found = mountains.find(m => (m.NAME || m.name || "").includes(searchKeyword));
        if (found && webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'PAN_TO',
                lat: found.LAT || found.lat,
                lng: found.LON || found.lon
            }));
        } else {
            Alert.alert("알림", "해당하는 산을 찾을 수 없습니다.");
        }
    };

    const onMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MARKER_CLICK') {
                router.push(`/mountain/${data.id}`);
            }
        } catch (e) {
            console.error("메시지 수신 에러:", e);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 상단 검색바 영역 */}
            <View className="p-4 bg-white border-b border-gray-100 shadow-sm z-20 mt-4">
                <View className="relative flex-row items-center bg-gray-100 rounded-2xl px-4 h-11">
                    <Search size={18} color="#9ca3af" />
                    <TextInput
                        className="flex-1 ml-2 text-sm text-gray-800"
                        placeholder="어떤 산을 찾으시나요?"
                        value={searchKeyword}
                        onChangeText={setSearchKeyword}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                </View>
                {/* 태그 버튼들 */}
                <View className="flex-row mt-3 gap-2">
                    {['산', '추천코스'].map(tag => (
                        <TouchableOpacity key={tag} className="bg-white border border-gray-200 rounded-full px-4 py-1.5">
                            <Text className="text-[11px] font-medium text-gray-600">{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 지도 영역 */}
            <View className="flex-1 relative">
                {loading && (
                    <View className="absolute inset-0 z-10 bg-white/50 justify-center items-center">
                        <ActivityIndicator size="large" color="#15803d" />
                    </View>
                )}

                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    userAgent="Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/114.0 Firefox/114.0"
                    source={{ html: getKakaoMapHtml("9c3cba91e55b9235299a3d7119d22830") }}
                    onMessage={onMessage}
                    onLoadEnd={() => {
                        if (mountains.length > 0) {
                            webViewRef.current.postMessage(JSON.stringify({
                                type: 'INIT_MAP',
                                mountains: mountains
                            }));
                        }
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            </View>
        </SafeAreaView>
    );
}