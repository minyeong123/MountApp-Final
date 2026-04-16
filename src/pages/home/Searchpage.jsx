import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, Search, X } from "lucide-react-native";
import { styled } from "nativewind";

// NativeWind를 사용하면 className을 직접 쓸 수 있습니다.
export default function SearchPage({ navigation }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState([]);

    const popularKeywords = [
        { rank: 1, name: "북한산 백운대 코스" }, { rank: 2, name: "실시간 벚꽃 개화현황" },
        { rank: 3, name: "설악산 대청봉 예약" }, { rank: 4, name: "영남알프스 8봉 완등" },
        { rank: 5, name: "강원도 트레킹 명소" }, { rank: 6, name: "관악산 최단코스" },
        { rank: 7, name: "등산화 계급도" }, { rank: 8, name: "무등산 국립공원" },
        { rank: 9, name: "지리산 노고단 일출" }, { rank: 10, name: "한라산 탐방 예약방법" },
    ];

    const recommendedTags = ["#국립공원", "#풍경", "#사찰", "#100대명산", "#바다", "#야경", "#홍매화", "#봄", "#DMZ", "#아이더로드"];

    useEffect(() => {
        const loadSearches = async () => {
            const saved = await AsyncStorage.getItem("recent_searches");
            if (saved) setRecentSearches(JSON.parse(saved));
        };
        loadSearches();
    }, []);

    const onSearchSubmit = async (keyword) => {
        const cleanKeyword = keyword.trim();
        if (!cleanKeyword) return;

        const updated = [cleanKeyword, ...recentSearches.filter((item) => item !== cleanKeyword)].slice(0, 10);
        setRecentSearches(updated);
        await AsyncStorage.setItem("recent_searches", JSON.stringify(updated));

        // 결과 페이지 이동 로직 (필요시 주석 해제)
        // navigation.navigate("SearchResult", { q: cleanKeyword });
        console.log("검색:", cleanKeyword);
    };

    const clearAll = () => {
        Alert.alert("알림", "최근 검색어를 모두 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { text: "삭제", onPress: async () => {
                    setRecentSearches([]);
                    await AsyncStorage.removeItem("recent_searches");
                }, style: "destructive" }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4">
                {/* 검색 헤더 */}
                <View className="flex-row items-center space-x-3 mb-6">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                        <ChevronLeft size={28} color="#1f2937" />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row items-center bg-gray-50 border border-gray-200 rounded-full px-4">
                        <Search size={20} color="#9ca3af" className="mr-2" />
                        <TextInput
                            className="flex-1 h-11 text-[16px] text-gray-800"
                            placeholder="어디로 갈까요?"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={() => onSearchSubmit(searchQuery)}
                            returnKeyType="search"
                            autoFocus={true}
                        />
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* 최근 검색어 */}
                    <View className="mt-4">
                        <View className="flex-row justify-between items-end mb-4">
                            <h3 className="text-lg font-bold text-gray-900">최근 검색어</h3>
                            {recentSearches.length > 0 && (
                                <TouchableOpacity onPress={clearAll}>
                                    <Text className="text-xs text-gray-400 font-medium pb-1">전체 삭제 ✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {recentSearches.length > 0 ? (
                                recentSearches.map((item) => (
                                    <View key={item} className="flex-row items-center bg-white border border-gray-200 rounded-full px-3 py-1.5 mr-2">
                                        <TouchableOpacity onPress={() => onSearchSubmit(item)}>
                                            <Text className="text-sm text-gray-600">{item}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            const updated = recentSearches.filter(i => i !== item);
                                            setRecentSearches(updated);
                                            AsyncStorage.setItem("recent_searches", JSON.stringify(updated));
                                        }} className="ml-1">
                                            <X size={12} color="#9ca3af" />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-sm text-gray-400 py-2">최근 검색어가 없습니다.</Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* 인기 검색어 */}
                    <View className="mt-10">
                        <Text className="text-lg font-bold text-gray-900 mb-5">지금 찾는 인기 검색어</Text>
                        <View className="flex-row flex-wrap">
                            {popularKeywords.map((item) => (
                                <TouchableOpacity
                                    key={item.rank}
                                    className="w-1/2 flex-row items-center mb-4 pr-2"
                                    onPress={() => onSearchSubmit(item.name)}
                                >
                                    <Text className={`w-6 text-[15px] font-bold ${item.rank <= 3 ? 'text-blue-900' : 'text-gray-400'}`}>
                                        {item.rank}
                                    </Text>
                                    <Text className="text-[15px] font-medium text-gray-700 flex-1" numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 추천 해시태그 */}
                    <View className="mt-8 pb-20">
                        <Text className="text-lg font-bold text-gray-900 mb-5">추천 해시태그</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {recommendedTags.map((tag, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg"
                                    onPress={() => onSearchSubmit(tag.replace('#', ''))}
                                >
                                    <Text className="text-sm text-gray-600 font-medium">{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}