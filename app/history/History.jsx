import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, ImageBackground, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// 샘플 데이터
const hikingRecords = [
    {
        id: 1,
        mountainName: "북한산",
        courseName: "백운대 코스",
        date: "2026. 05. 17",
        status: "완료",
        mapImage: { uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80" },
        duration: "02:45:12",
        distance: "4.2km",
        calories: "650",
        heartRate: "126"
    },
    {
        id: 2,
        mountainName: "관악산",
        courseName: "연주대 코스",
        date: "2026. 05. 10",
        status: "완료",
        mapImage: { uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80" },
        duration: "01:58:30",
        distance: "3.8km",
        calories: "520",
        heartRate: "134"
    }
];

export default function HikingHistoryScreen() {
    const [activeFilter, setActiveFilter] = useState('전체');

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />

            {/* 상단 네비게이션 헤더 */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                <TouchableOpacity className="p-1 rounded-full">
                    <Icon name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-base font-bold text-gray-800 flex-1 text-center">나의 등산 기록</Text>
                <TouchableOpacity className="p-1 rounded-full">
                    <Icon name="share-2" size={20} color="#333" />
                </TouchableOpacity>
            </View>

            {/* 메인 스크롤 뷰 */}
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {/* 대타이틀 */}
                <Text className="text-2xl font-black text-gray-900 mb-4">나의 등산 기록</Text>

                {/* 필터 탭 바 */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-5">
                    {['전체', '이번 달', '지난 달'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveFilter(tab)}
                            className={`px-4 py-2 rounded-full mr-2 ${activeFilter === tab ? 'bg-gray-800' : 'bg-gray-200'}`}
                        >
                            <Text className={`text-sm font-medium ${activeFilter === tab ? 'text-white' : 'text-gray-600'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity className="flex-row items-center bg-white border border-gray-200 px-3.5 py-2 rounded-full ml-auto shadow-sm">
                        <Text className="text-sm text-gray-700 mr-1">산별 보기</Text>
                        <Icon name="chevron-down" size={14} color="#555" />
                    </TouchableOpacity>
                </ScrollView>

                {/* 등산 기록 카드 리스트 */}
                <View className="space-y-4">
                    {hikingRecords.map((record) => (
                        <TouchableOpacity key={record.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4" activeOpacity={0.9}>

                            {/* 카드 상단 정보 */}
                            <View className="flex-row mb-4">
                                {/* 미니 지도 이미지 */}
                                <ImageBackground source={record.mapImage} style={{ width: 88, height: 88 }} imageStyle={{ borderRadius: 12 }}>
                                    <View className="absolute inset-0 bg-emerald-500/5" />
                                </ImageBackground>

                                {/* 텍스트 정보 */}
                                <View className="flex-1 ml-3.5 justify-between py-0.5">
                                    <View className="flex-row justify-between items-start">
                                        <Text className="text-base font-bold text-gray-900 max-w-[75%]" numberOfLines={1}>
                                            {record.mountainName}a
                                            <Text className="text-xs font-normal text-gray-500"> ({record.courseName})</Text>
                                        </Text>
                                        <View className="bg-emerald-50 px-2.5 py-1 rounded-xl">
                                            <Text className="text-[11px] font-semibold text-emerald-600">{record.status}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center">
                                        <Icon name="calendar" size={14} color="#999" className="mr-1" />
                                        <Text className="text-xs text-gray-400">{record.date}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* 카드 하단 4분할 데이터 */}
                            <View className="flex-row justify-between border-t border-gray-50 pt-3 gap-1.5">
                                {/* 운동 시간 */}
                                <View className="flex-1 bg-gray-50 rounded-xl py-2 items-center">
                                    <Icon name="clock" size={16} color="#10b981" />
                                    <Text className="text-[10px] text-gray-400 font-medium mt-1">운동 시간</Text>
                                    <Text className="text-xs font-bold text-gray-800 mt-0.5">{record.duration}</Text>
                                </View>
                                {/* 이동 거리 */}
                                <View className="flex-1 bg-gray-50 rounded-xl py-2 items-center">
                                    <Icon name="map-pin" size={16} color="#0ea5e9" />
                                    <Text className="text-[10px] text-gray-400 font-medium mt-1">이동 거리</Text>
                                    <Text className="text-xs font-bold text-gray-800 mt-0.5">{record.distance}</Text>
                                </View>
                                {/* 칼로리 */}
                                <View className="flex-1 bg-gray-50 rounded-xl py-2 items-center">
                                    <Icon name="zap" size={16} color="#f97316" />
                                    <Text className="text-[10px] text-gray-400 font-medium mt-1">칼로리</Text>
                                    <Text className="text-xs font-bold text-gray-800 mt-0.5">{record.calories} kcal</Text>
                                </View>
                                {/* 심박수 */}
                                <View className="flex-1 bg-gray-50 rounded-xl py-2 items-center">
                                    <Icon name="heart" size={16} color="#f43f5e" />
                                    <Text className="text-[10px] text-gray-400 font-medium mt-1">심박수</Text>
                                    <Text className="text-xs font-bold text-gray-800 mt-0.5">{record.heartRate} bpm</Text>
                                </View>
                            </View>

                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}