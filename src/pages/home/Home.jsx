import React, { useState, useEffect } from "react";
import {
    View, Text, ScrollView, Image, TouchableOpacity,
    SafeAreaView, ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { Siren, Search, MessageCircleMore } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import DisasterBanner from "../../../components/DisasterBanner";
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const logo = require("../../../assets/images/logo.png");

// 🔥 디버깅용 서버 주소 설정 함수
const getDebuggingUrl = () => {
    return "http://10.0.2.2:8082"; // [1] 에뮬레이터용
    // return "http://mountapp.mooo.com:8082"; // [3] DDNS 외부망 테스트용
};

const API_BASE_URL = getDebuggingUrl();
const ENCODING_KEY = "D4HOdxG7MU6ChcZPPl6q2mG2In%2FDM%2BwjAVif6pJFHS91I52JjltPYQOl5b26uQ1EBE7FuXWljJOodT1Ge4iLHA%3D%3D";

export default function Home() {
    const router = useRouter();
    const [mountains, setMountains] = useState([]);
    const [disasterAlerts, setDisasterAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 💡 이미지 URL 처리 (앱 환경에 맞게 uri 객체 반환)
    const getSafeImageSource = (path) => {
        if (!path || typeof path !== 'string') return logo;
        if (path.startsWith("http") && !path.includes("8082") && !path.includes("mountapp.mooo.com")) {
            return { uri: path };
        }
        const filename = path.split('\\').pop().split('/').pop();
        return { uri: `${API_BASE_URL}/uploads/${filename}` };
    };

    // 💡 앱(RN)용 XML 정규식 파싱 함수 (DOMParser 대체)
    const extractXmlData = (xml, itemTag) => {
        const items = [];
        const itemRegex = new RegExp(`<${itemTag}>(.*?)</${itemTag}>`, 'gs');
        let match;
        while ((match = itemRegex.exec(xml)) !== null) {
            items.push(match[1]);
        }
        return items;
    };

    const getTagValue = (itemXml, tag) => {
        const regex = new RegExp(`<${tag}>(.*?)</${tag}>`);
        const match = itemXml.match(regex);
        return match ? match[1] : null;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. 토큰 가져오기 (localStorage -> AsyncStorage)
                const token = await AsyncStorage.getItem("jwtToken");

                // 2. 산 데이터 로딩
                const mountRes = await axios.get(`${API_BASE_URL}/api/mountains`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setMountains(mountRes.data);

                // 3. 재난 API 로딩 (네트워크 에러 방지를 위해 https 적용)
                const fireUrl = `https://apis.data.go.kr/1400000/ForestStusService/getForestStusInfo?serviceKey=${ENCODING_KEY}&numOfRows=5&pageNo=1`;
                const landUrl = `https://apis.data.go.kr/1400000/ForestLandslideService/getLandslideInfo?serviceKey=${ENCODING_KEY}&numOfRows=5&pageNo=1`;

                const [fireRes, landRes] = await Promise.all([
                    axios.get(fireUrl),
                    axios.get(landUrl)
                ]);

                const newAlerts = [];

                // 산불 데이터 파싱
                const fireItems = extractXmlData(fireRes.data, "item");
                fireItems.forEach((item, i) => {
                    const loc = getTagValue(item, "locNm") || "위치 미상";
                    const time = getTagValue(item, "stDate") || "시간 미상";
                    newAlerts.push({ id: `fire-${i}`, type: "FIRE", message: `${loc} 인근 산불 발생`, time: time });
                });

                // 산사태 데이터 파싱
                const landItems = extractXmlData(landRes.data, "item");
                landItems.forEach((item, i) => {
                    const area = getTagValue(item, "areaName") || "지역 미상";
                    const time = getTagValue(item, "createTime") || "";
                    const level = getTagValue(item, "step") || "주의보";
                    newAlerts.push({ id: `land-${i}`, type: "LANDSLIDE", message: `${area} 산사태 ${level} 발령`, time: time });
                });

                // 테스트 데이터 삽입
                newAlerts.push(
                    { id: "test-fire", type: "FIRE", message: "[테스트] 설악산 인근 대형 산불 발생", time: "현재" },
                    { id: "test-land", type: "LANDSLIDE", message: "[테스트] 강원도 평창군 산사태 경보", time: "현재" }
                );

                if (newAlerts.length === 0) {
                    setDisasterAlerts([{ id: 999, type: "INFO", message: "현재 발효된 특보가 없습니다.", time: new Date().toLocaleTimeString() }]);
                } else {
                    setDisasterAlerts(newAlerts);
                }

            } catch (error) {
                console.error("데이터 로딩 실패:", error);
                setDisasterAlerts([{ id: 0, type: "INFO", message: "재난 정보를 불러오지 못했습니다.", time: "" }]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4">
                {/* 헤더 */}
                <View className="flex-row justify-between items-center py-6 mt-4">
                    <View className="flex-row items-center">
                        <Image source={logo} className="w-12 h-12 rounded-full " resizeMode="cover" />
                        {/* 그라데이션 텍스트 적용 영역 */}
                        <MaskedView
                            // height를 텍스트 크기에 맞춰 40 정도로 줄이고 수직 중앙 정렬 추가
                            style={{ width: 160, height: 40, marginLeft: 8, justifyContent: 'center' }}
                            maskElement={
                                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center' }}>
                                    <Text
                                        style={{
                                            fontSize: 25, // 크기를 살짝 키웠습니다.
                                            fontWeight: '900',
                                            includeFontPadding: false, // 안드로이드 폰트 기본 여백 제거 (중앙 맞춤 필수)
                                            textAlignVertical: 'center' // 안드로이드 세로 중앙
                                        }}
                                    >
                                        MountApp
                                    </Text>
                                </View>
                            }
                        >
                            <LinearGradient
                                colors={['#16a34a', '#2563eb']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ flex: 1 }}
                            />
                        </MaskedView>
                    </View>
                    <View className="flex-row">
                        <TouchableOpacity onPress={() => router.push("/home/searchpage")}>
                            <Search size={24} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity className="ml-4" onPress={() => router.push("/mate/chat")}>
                            <MessageCircleMore size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 산악 가이드 */}
                <View className="mb-6">
                    <Text className="text-lg font-bold mb-2 pb-1 border-b border-gray-100">산악 가이드 정보</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#15803d" />
                        ) : mountains.length === 0 ? (
                            <Text className="p-4 text-gray-500 w-full text-center">등록된 산 정보가 없습니다.</Text>
                        ) : (
                            mountains.map((mt) => (
                                <TouchableOpacity
                                    key={mt.id}
                                    className="w-[220px] mr-4 bg-white rounded-2xl border border-gray-200 overflow-hidden"
                                    onPress={() => router.push(`/mountain/${mt.id}`)}
                                >
                                    <View className="h-[100px] bg-gray-50 items-center justify-center">
                                        <Image
                                            source={getSafeImageSource(mt.imageUrl?.split(",")[0])}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <View className="p-3">
                                        <Text className="text-base font-bold mb-1">{mt.name}</Text>
                                        <Text className="text-sm text-gray-500" numberOfLines={2}>{mt.description}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* 재난 알림 */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-2">
                        <Siren size={20} color="#b91c1c" />
                        <Text className="text-lg font-bold text-[#b91c1c] ml-1.5">실시간 재난 알림</Text>
                    </View>
                    <View className="bg-[#fef2f2] p-4 rounded-2xl border border-[#fee2e2]">
                        {loading ? (
                            <ActivityIndicator size="small" color="#b91c1c" />
                        ) : (
                            <DisasterBanner alerts={disasterAlerts} />
                        )}
                    </View>
                </View>

                {/* 유의사항 */}
                <View className="bg-gray-100 p-5 rounded-2xl border-l-4 border-gray-400 mb-8">
                    <Text className="text-base font-bold mb-2">☑️ 유의사항</Text>
                    <Text className="text-sm text-gray-600 mb-1">• 등산 전 반드시 기상청 정보를 확인하세요.</Text>
                    <Text className="text-sm text-gray-600">• 비상 상황 발생 시 즉시 119에 신고하세요.</Text>
                    <Text className="text-sm text-gray-600">• 모든 산행은 본인의 책임하에 이루어집니다.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}