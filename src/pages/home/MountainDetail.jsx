import React, { useEffect, useState, useRef } from "react";
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    ActivityIndicator, Dimensions, SafeAreaView, Platform, StatusBar
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft, Mountain as MountainIcon, Flag, CheckCircle2,
    ChevronLeft, ChevronRight, Info, Clock, Navigation, MapPin,
    AlertTriangle // <-- 유의사항 아이콘 추가
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

    const scrollViewRef = useRef(null);

    const getSafeImageSource = (path) => {
        if (!path || typeof path !== 'string') return LOGO_IMAGE;
        if (path.startsWith("http") && !path.includes("8082") && !path.includes("mountapp.mooo.com")) return { uri: path };
        const filename = path.split('\\').pop().split('/').pop();
        return { uri: `${API_BASE_URL}/uploads/${filename}` };
    };

    const handleScrollToImage = (direction) => {
        const images = mountain?.imageUrl ? mountain.imageUrl.split(",") : [];
        let nextIndex = currentImageIndex;

        if (direction === "prev" && currentImageIndex > 0) {
            nextIndex = currentImageIndex - 1;
        } else if (direction === "next" && currentImageIndex < images.length - 1) {
            nextIndex = currentImageIndex + 1;
        }

        if (nextIndex !== currentImageIndex) {
            scrollViewRef.current?.scrollTo({
                x: nextIndex * width,
                animated: true,
            });
            setCurrentImageIndex(nextIndex);
        }
    };

    useEffect(() => {
        const fetchMountainDetail = async () => {
            try {
                const token = await AsyncStorage.getItem("jwtToken");
                const res = await axios.get(`${API_BASE_URL}/api/mountains/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setMountain(res.data);
            } catch (error) {
                console.error("로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchMountainDetail();
    }, [id]);

    if (loading) return (
        <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
            <ActivityIndicator size="large" color="#15803d" />
            <Text className="mt-2 text-gray-500">로딩 중...</Text>
        </SafeAreaView>
    );

    const images = mountain?.imageUrl ? mountain.imageUrl.split(",") : [];

    // DB의 notices 혹은 notice 컬럼 매핑 (백엔드 필드명에 맞게 조정하세요)
    const noticeText = mountain?.notices || mountain?.notice || "";
    // 쉼표나 줄바꿈으로 구분되어 있을 경우를 대비해 배열로 변환
    const noticeList = noticeText ? noticeText.split(/[,\n]/).map(item => item.trim()).filter(Boolean) : [];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white" stickyHeaderIndices={[3]} nestedScrollEnabled={true} >
                {/* 헤더 영역 */}
                <View className="flex-row items-center justify-center pt-5 pb-3 bg-white relative">
                    <TouchableOpacity onPress={() => router.back()} className="absolute left-4 p-2">
                        <ArrowLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">{mountain?.name}</Text>
                </View>

                {/* 이미지 스와이프 영역 */}
                <View className="relative w-full h-[250px] bg-gray-100">
                    {images.length > 0 ? (
                        <>
                            <ScrollView
                                ref={scrollViewRef}
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
                                <View className="absolute w-full h-full flex-row justify-between items-center px-2" pointerEvents="box-none">
                                    <TouchableOpacity
                                        onPress={() => handleScrollToImage("prev")}
                                        disabled={currentImageIndex === 0}
                                        className={`bg-black/30 rounded-full p-2 ${currentImageIndex === 0 ? 'opacity-30' : ''}`}
                                    >
                                        <ChevronLeft size={24} color="white" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleScrollToImage("next")}
                                        disabled={currentImageIndex === images.length - 1}
                                        className={`bg-black/30 rounded-full p-2 ${currentImageIndex === images.length - 1 ? 'opacity-30' : ''}`}
                                    >
                                        <ChevronRight size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    ) : (
                        <Image source={LOGO_IMAGE} className="w-full h-full" resizeMode="contain" />
                    )}
                </View>

                {/* 산 설명 */}
                <View className="px-5 py-6 border-b-[6px] border-gray-100">
                    <Text className="text-gray-700 text-[15px] leading-6">
                        {mountain?.description}
                    </Text>
                </View>

                {/* 탭 버튼 영역 */}
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

                {/* 탭 내용 */}
                <View className="p-5 bg-gray-50/50 ">
                    {/* [홈 탭] */}
                    {tab === "home" && (
                        <View className="space-y-4">
                            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <View className="flex-row items-center mb-5">
                                    <Info size={18} color="#2563eb" />
                                    <Text className="font-bold text-gray-800 ml-2 text-base">산행 정보</Text>
                                </View>

                                <View className="flex-col">
                                    <View className="flex-row pb-4 border-b border-gray-100">
                                        <View className="flex-1 items-center border-r border-gray-100">
                                            <Text className="text-gray-400 text-xs mb-1">최고 고도</Text>
                                            <View className="flex-row items-center">
                                                <MountainIcon size={20} color="#4b5563" />
                                                <Text className="text-lg font-bold text-gray-800 ml-1">
                                                    {mountain?.height ? `${mountain.height}m` : "-"}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-1 items-center">
                                            <Text className="text-gray-400 text-xs mb-1">난이도</Text>
                                            <View className="flex-row items-center">
                                                <Flag size={20} color="#eab308" />
                                                <Text className="text-lg font-bold text-gray-800 ml-1">
                                                    {mountain?.difficulty || "보통"}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View className="flex-row pt-4">
                                        <View className="flex-1 items-center border-r border-gray-100">
                                            <Text className="text-gray-400 text-xs mb-1">왕복 시간</Text>
                                            <View className="flex-row items-center">
                                                <Clock size={20} color="#3b82f6" />
                                                <Text className="text-lg font-bold text-gray-800 ml-1">
                                                    {mountain?.runningTime || "-"}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-1 items-center">
                                            <Text className="text-gray-400 text-xs mb-1">총 거리</Text>
                                            <View className="flex-row items-center">
                                                <Navigation size={20} color="#22c55e" />
                                                <Text className="text-lg font-bold text-gray-800 ml-1">
                                                    {mountain?.distance || "-"}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex-row items-center justify-between mt-5">
                                <View className="flex-1 pr-3">
                                    <Text className="font-bold text-gray-800 text-sm mb-1">위치</Text>
                                    <Text className="text-gray-500 text-xs leading-4">
                                        {mountain?.location || "위치 정보가 없습니다."}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: "/map",
                                        params: { lat: mountain?.lat, lon: mountain?.lon, name: mountain?.name }
                                    })}
                                    className="bg-gray-100 p-3 rounded-full active:bg-gray-200"
                                >
                                    <MapPin size={20} color="#4b5563" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* 추천코스 탭 */}
                    {tab === "course" && (
                        <View style={{ flex: 1, minHeight: 400 }}>
                            <MountainCourse id={id} />
                        </View>
                    )}

                    {/* 날씨 탭 */}
                    {tab === "weather" && <MountainWeather mountain={mountain} />}

                    {/* [유의사항 탭] - 추가된 영역 */}
                    {tab === "notice" && (
                        <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm min-h-[200px]">
                            <View className="flex-row items-center mb-4">
                                <AlertTriangle size={20} color="#dc2626" />
                                <Text className="font-bold text-gray-800 ml-2 text-base">안전 산행 유의사항</Text>
                            </View>

                            {noticeList.length > 0 ? (
                                <View className="space-y-3">
                                    {noticeList.map((item, index) => (
                                        <View key={index} className="flex-row items-start bg-red-50/40 p-3 rounded-xl border border-red-100/50">
                                            <Text className="text-red-500 font-bold mr-2 mt-[2px]">•</Text>
                                            <Text className="text-gray-700 text-[14px] flex-1 leading-5">
                                                {item}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View className="flex-1 justify-center items-center py-8">
                                    <Text className="text-gray-400 text-sm">등록된 특이사항이나 유의사항이 없습니다.</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}