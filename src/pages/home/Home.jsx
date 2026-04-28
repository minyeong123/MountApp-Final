import React, { useState, useEffect } from "react";
import {
    View, Text, ScrollView, Image, TouchableOpacity,
    SafeAreaView, ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { Siren, Search, MessageCircleMore } from "lucide-react-native";
import DisasterBanner from "../../../components/DisasterBanner";

const logo = require("../../assets/logo.png");

export default function Home() {
    const router = useRouter();
    const [mountains, setMountains] = useState([]);
    const [disasterAlerts, setDisasterAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fakeMountains = [
            { id: 1, name: "설악산", description: "강원도 속초시에 있는 높이 1,708m의 산입니다." },
            { id: 2, name: "북한산", description: "서울과 경기도에 걸쳐 있는 국립공원입니다." },
            { id: 3, name: "한라산", description: "제주도에 위치한 대한민국 최고봉 산입니다." },
        ];
        const fakeAlerts = [
            { id: "test-fire", type: "FIRE", message: "[실시간] 전국 산불 조심 기간 안내", time: "현재" },
            { id: "test-land", type: "LANDSLIDE", message: "[안내] 등산 전 기상 정보를 확인하세요", time: "현재" }
        ];
        setMountains(fakeMountains);
        setDisasterAlerts(fakeAlerts);
        setLoading(false);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4">
                {/* 헤더 */}
                <View className="flex-row justify-between items-center py-4">
                    <View className="flex-row items-center">
                        <Image source={logo} className="w-9 h-9 rounded-full" resizeMode="contain" />
                        <Text className="text-xl font-black text-[#15803d] ml-2">MountApp</Text>
                    </View>
                    <View className="flex-row">
                        <TouchableOpacity onPress={() => router.push("/search")}>
                            <Search size={24} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity className="ml-4" onPress={() => router.push("/chat")}>
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
                        ) : (
                            mountains.map((mt) => (
                                <TouchableOpacity
                                    key={mt.id}
                                    className="w-[220px] mr-4 bg-white rounded-2xl border border-gray-200 overflow-hidden"
                                    onPress={() => router.push(`/mountain/${mt.id}`)}
                                >
                                    <View className="h-[100px] bg-gray-50 items-center justify-center">
                                        <Image source={logo} className="w-10 h-10 opacity-20" resizeMode="contain" />
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
                        <DisasterBanner alerts={disasterAlerts} />
                    </View>
                </View>

                {/* 유의사항 */}
                <View className="bg-gray-100 p-5 rounded-2xl border-l-4 border-gray-400 mb-8">
                    <Text className="text-base font-bold mb-2">☑️ 유의사항</Text>
                    <Text className="text-sm text-gray-600 mb-1">• 등산 전 반드시 기상청 정보를 확인하세요.</Text>
                    <Text className="text-sm text-gray-600">• 비상 상황 발생 시 즉시 119에 신고하세요.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}