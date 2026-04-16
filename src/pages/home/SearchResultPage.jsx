import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import { ChevronLeft, X, MapPin } from "lucide-react-native";

export default function SearchResultPage({ route, navigation }) {
    // 1. 네이티브에서 파라미터 받기 (route.params)
    const { q = "" } = route.params || {};
    const [searchQuery, setSearchQuery] = useState(q);
    const [activeTab, setActiveTab] = useState("전체");

    const tabs = ["전체", "산", "코스", "게시글", "리뷰", "메이트"];

    // --- 각 섹션 컴포넌트 ---
    const MountainSection = () => (
        <View className="mb-8">
            <Text className="font-bold text-lg mb-4 text-gray-900">산 <Text className="text-blue-600">1</Text></Text>
            <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <View className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden">
                    <Image
                        source={{ uri: "https://via.placeholder.com/100" }}
                        className="w-full h-full object-cover"
                    />
                </View>
                <View className="flex-1 ml-4">
                    <Text className="font-bold text-[17px] text-gray-900">{searchQuery}</Text>
                    <Text className="text-sm text-gray-500 mt-1">836m · 경기 고양시</Text>
                    <View className="flex-row mt-2">
                        <View className="bg-orange-100 px-2 py-0.5 rounded">
                            <Text className="text-[10px] text-orange-600 font-bold">보통</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );

    const CourseSection = () => (
        <View className="mb-8">
            <Text className="font-bold text-lg mb-4 text-gray-900">코스 <Text className="text-blue-600">30</Text></Text>
            {[1, 2, 3].map((_, i) => (
                <TouchableOpacity key={i} className="flex-row items-center py-4 border-b border-gray-100">
                    <View className="w-16 h-16 bg-gray-100 rounded-xl items-center justify-center">
                        <MapPin size={20} color="#9ca3af" />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-[11px] text-gray-400 font-bold mb-1">📍 코스</Text>
                        <Text className="font-bold text-[15px] text-gray-800" numberOfLines={1}>{searchQuery} 둘레길 {i + 1}코스</Text>
                        <Text className="text-xs text-gray-500 mt-1">1시간 15분 · <Text className="text-blue-500 font-bold">쉬움</Text></Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const CommunitySection = ({ type }) => (
        <View className="mb-8">
            <Text className="font-bold text-lg mb-4 text-gray-900">{type} <Text className="text-blue-600">0</Text></Text>
            <View className="py-12 items-center">
                <Text className="text-gray-400 text-sm">{searchQuery}에 대한 {type} 데이터가 없습니다.</Text>
            </View>
        </View>
    );

    const MateSection = () => (
        <View className="mb-8">
            <Text className="font-bold text-lg mb-4 text-gray-900">메이트 <Text className="text-blue-600">5</Text></Text>
            <View className="bg-blue-50 p-5 rounded-2xl">
                <Text className="text-sm font-bold text-blue-900">함께 등산할 메이트를 찾아보세요!</Text>
                <TouchableOpacity className="mt-3">
                    <Text className="text-xs text-blue-600 font-black">진행중인 번개 보기 →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // --- 탭 렌더링 로직 ---
    const renderContent = () => {
        switch (activeTab) {
            case "산": return <MountainSection />;
            case "코스": return <CourseSection />;
            case "게시글": return <CommunitySection type="게시글" />;
            case "리뷰": return <CommunitySection type="리뷰" />;
            case "메이트": return <MateSection />;
            default:
                return (
                    <>
                        <MountainSection />
                        <CourseSection />
                        <MateSection />
                    </>
                );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 섹션 */}
            <View className="px-4 pt-2 pb-4 border-b border-gray-100">
                <View className="flex-row items-center space-x-3">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ChevronLeft size={28} color="#1f2937" />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 h-11">
                        <TextInput
                            className="flex-1 text-sm text-gray-800"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="검색어 입력"
                        />
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <X size={18} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 탭 네비게이션 */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row mt-5"
                >
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`mr-6 pb-2 ${activeTab === tab ? "border-b-2 border-blue-900" : ""}`}
                        >
                            <Text className={`text-[15px] font-bold ${activeTab === tab ? "text-blue-900" : "text-gray-400"}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 결과 리스트 */}
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {renderContent()}
            </ScrollView>
        </SafeAreaView>
    );
}