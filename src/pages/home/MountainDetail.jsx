import React, { useEffect, useState } from "react";
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    ActivityIndicator, Dimensions, SafeAreaView, Platform, StatusBar
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft, Mountain as MountainIcon, Flag, CheckCircle2,
    ChevronLeft, ChevronRight, Info
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import MountainCourse from "./MountainCourse";
import MountainWeather from "./MountainWeather";

const LOGO_IMAGE = require("../../../assets/images/bukhan_c1.jpg");
const { width } = Dimensions.get("window");
const API_BASE_URL = "http://10.0.2.2:8082";

export default function MountainDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [mountain, setMountain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("home");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // ✨ id 타입을 안전하게 문자열로 고정 (배열로 들어올 경우 예외 처리)
    const safeId = Array.isArray(id) ? id[0] : id;

    const getSafeImageSource = (path) => {
        if (!path || typeof path !== 'string') return LOGO_IMAGE;
        if (path.startsWith("http") && !path.includes("8082") && !path.includes("mountapp.mooo.com")) return { uri: path };
        const filename = path.split('\\').pop().split('/').pop();
        return { uri: `${API_BASE_URL}/uploads/${filename}` };
    };

    useEffect(() => {
        const fetchMountainDetail = async () => {
            try {
                const token = await AsyncStorage.getItem("jwtToken");
                const res = await axios.get(`${API_BASE_URL}/api/mountains/${safeId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setMountain(res.data);
            } catch (error) {
                console.error("로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        if (safeId) fetchMountainDetail();
    }, [safeId]);

    if (loading) return (
        <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
            <ActivityIndicator size="large" color="#15803d" />
            <Text className="mt-2 text-gray-500">로딩 중...</Text>
        </SafeAreaView>
    );

    const images = mountain?.imageUrl ? mountain.imageUrl.split(",") : [];

    return (
        <SafeAreaView
            className="flex-1 bg-white"
            style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
        >
            <ScrollView
                className="flex-1 bg-white"
                stickyHeaderIndices={[3]}
                // ✨removeClippedSubviews 속성을 제거하거나 false로 두어 탭 전환 시 컴포넌트 뷰 유실을 방지합니다.
                removeClippedSubviews={false}
            >
                {/* [0] 헤더 영역 */}
                <View className="flex-row items-center justify-center p-4 bg-white relative">
                    <TouchableOpacity onPress={() => router.back()} className="absolute left-4 p-2">
                        <ArrowLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">{mountain?.name}</Text>
                </View>

                {/* [1] 이미지 스와이프 영역 */}
                <View className="relative w-full h-[250px] bg-gray-100">
                    {images.length > 0 ? (
                        <>
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={(e) => {
                                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                                    setCurrentImageIndex(index);
                                }}
                                style={{ width, height: 250 }}
                            >
                                {images.map((imgUrl, index) => (
                                    <Image
                                        key={index}
                                        source={getSafeImageSource(imgUrl)}
                                        style={{ width, height: 250 }}
                                        resizeMode="cover"
                                    />
                                ))}
                            </ScrollView>
                            {images.length > 1 && (
                                <View className="absolute w-full h-full flex-row justify-between items-center px-2" pointerEvents="none">
                                    <View className="bg-black/20 rounded-full p-1"><ChevronLeft size={24} color="white" /></View>
                                    <View className="bg-black/20 rounded-full p-1"><ChevronRight size={24} color="white" /></View>
                                </View>
                            )}
                        </>
                    ) : (
                        <Image source={LOGO_IMAGE} className="w-full h-full" resizeMode="contain" />
                    )}
                </View>

                {/* [2] 산 설명 */}
                <View className="px-5 py-6 border-b-[6px] border-gray-100">
                    <Text className="text-gray-700 text-[15px] leading-6">
                        {mountain?.description}
                    </Text>
                </View>

                {/* [3] 탭 버튼 영역 */}
                <View className="flex-row justify-around bg-white border-b border-gray-200">
                    {["home", "course", "weather", "notice"].map((t) => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setTab(t)}
                            className={`py-4 px-4 ${tab === t ? 'border-b-2 border-blue-600' : ''}`}
                        >
                            <Text className={`text-[14px] font-bold ${tab === t ? 'text-blue-600' : 'text-gray-500'}`}>
                                {t === "home" ? "홈" : t === "course" ? "추천코스" : t === "weather" ? "날씨" : "유의사항"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* [4] 탭 내용 영역 */}
                <View className="p-5">
                    {tab === "home" && (
                        <View className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <View className="flex-row items-center mb-5">
                                <Info size={18} color="#2563eb" />
                                <Text className="font-bold text-gray-800 ml-2 text-base">산행 정보</Text>
                            </View>
                            <View className="flex-row justify-around">
                                <View className="items-center">
                                    <Text className="text-gray-400 text-xs mb-1">최고 고도</Text>
                                    <View className="flex-row items-center">
                                        <MountainIcon size={20} color="#374151" />
                                        <Text className="text-xl font-bold ml-1">{mountain?.height || 0}m</Text>
                                    </View>
                                </View>
                                <View className="items-center">
                                    <Text className="text-gray-400 text-xs mb-1">난이도</Text>
                                    <View className="flex-row items-center">
                                        <Flag size={20} color="#eab308" />
                                        <Text className="text-xl font-bold ml-1">보통</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {tab === "notice" && (
                        <View className="space-y-3">
                            {mountain?.notices ? (
                                mountain.notices.split("|").map((n, i) => (
                                    <View key={i} className="flex-row items-start bg-white p-4 rounded-xl border border-gray-100 mb-3 shadow-sm">
                                        <CheckCircle2 size={20} color="#22c55e" />
                                        <Text className="ml-3 text-gray-700 font-medium flex-1 text-sm">{n.trim()}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-center text-gray-400 mt-10">등록된 유의사항이 없습니다.</Text>
                            )}
                        </View>
                    )}

                    {/* ✨ 정제된 safeId를 전달하여 안전성 확보 */}
                    {tab === "course" && <MountainCourse id={safeId} />}

                    {tab === "weather" && <MountainWeather mountain={mountain} />}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}