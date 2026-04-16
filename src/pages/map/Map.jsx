import React, { useEffect, useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";
import { Search } from "lucide-react-native";
import axios from "axios";
import { getKakaoMapHtml } from "./KakaoMapHtml";

export default function Map({ navigation }) {
    const webViewRef = useRef(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [mountains, setMountains] = useState([]);

    // 1. DB 데이터 가져오기 (네이티브는 절대경로 URL 권장)
    useEffect(() => {
        const fetchMountainData = async () => {
            try {
                // 주의: localhost 대신 서버 IP 주소를 사용해야 에뮬레이터에서 작동합니다.
                const response = await axios.get('http://YOUR_SERVER_IP:8080/api/mountains');
                setMountains(response.data);
            } catch (error) {
                console.error("데이터 로드 실패:", error);
            }
        };
        fetchMountainData();
    }, []);

    // 2. 검색 처리
    const handleSearch = () => {
        const found = mountains.find(m => (m.NAME || m.name).includes(searchKeyword));
        if (found && webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'PAN_TO',
                lat: found.LAT || found.lat,
                lng: found.LON || found.lon
            }));
        }
    };

    // 3. 지도에서 보낸 메시지 수신 (마커 클릭 등)
    const onMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'MARKER_CLICK') {
            // 상세 페이지로 이동
            navigation.navigate("MountainDetail", { id: data.id });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 상단 검색바 섹션 */}
            <View className="p-4 z-20 bg-white shadow-md">
                <View className="relative mb-3 flex-row items-center bg-gray-100 rounded-2xl px-4">
                    <Search size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 h-11 ml-2 text-sm"
                        value={searchKeyword}
                        onChangeText={setSearchKeyword}
                        onSubmitEditing={handleSearch}
                        placeholder="어떤 산을 찾으시나요?"
                        returnKeyType="search"
                    />
                </View>

                <View className="flex-row space-x-2">
                    {['산', '추천코스'].map(tag => (
                        <TouchableOpacity
                            key={tag}
                            className="bg-white border border-gray-200 rounded-full px-4 py-2"
                        >
                            <Text className="text-xs font-bold text-gray-700">{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 지도 영역 */}
            <View className="flex-1">
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: getKakaoMapHtml("YOUR_KAKAO_JS_KEY") }}
                    onMessage={onMessage}
                    onLoadEnd={() => {
                        // 데이터가 로드된 후 지도에 전달
                        if (mountains.length > 0) {
                            webViewRef.current.postMessage(JSON.stringify({
                                type: 'INIT_MAP',
                                mountains: mountains
                            }));
                        }
                    }}
                />
            </View>
        </SafeAreaView>
    );
}