import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, Search, X } from "lucide-react-native";
import { useRouter } from "expo-router"; // 💡 추가

export default function SearchPage() {
    const router = useRouter(); // 💡 추가
    const [searchQuery, setSearchQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState([]);

    const popularKeywords = [
        { rank: 1, name: "북한산 백운대 코스" }, { rank: 2, name: "실시간 벚꽃 개화현황" },
        { rank: 3, name: "설악산 대청봉 예약" }, { rank: 4, name: "영남알프스 8봉 완등" },
        { rank: 5, name: "강원도 트레킹 명소" }, { rank: 6, name: "관악산 최단코스" },
        { rank: 7, name: "등산화 계급도" }, { rank: 8, name: "무등산 국립공원" },
        { rank: 9, name: "지리산 노고단 일출" }, { rank: 10, name: "한라산 탐방 예약방법" },
    ];

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

        // 💡 Expo Router 방식으로 데이터 전달하며 이동
        router.push({
            pathname: "/home/searchresultpage",
            params: { q: cleanKeyword }
        });
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
            <View className="p-4 flex-1 mt-6">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
                        <ChevronLeft size={28} color="#1f2937" />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row items-center bg-gray-50 border border-gray-200 rounded-full px-4">
                        <Search size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 h-11 text-[16px] text-gray-800 ml-2"
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
                    <View className="mt-4">
                        <View className="flex-row justify-between items-end mb-4">
                            <Text className="text-lg font-bold text-gray-900">최근 검색어</Text>
                            {recentSearches.length > 0 && (
                                <TouchableOpacity onPress={clearAll}>
                                    <Text className="text-xs text-gray-400 font-medium pb-1">전체 삭제 ✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {recentSearches.map((item) => (
                                <View key={item} className="flex-row items-center bg-white border border-gray-200 rounded-full px-3 py-1.5 mr-2">
                                    <TouchableOpacity onPress={() => onSearchSubmit(item)}>
                                        <Text className="text-sm text-gray-600">{item}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        const updated = recentSearches.filter(i => i !== item);
                                        setRecentSearches(updated);
                                        AsyncStorage.setItem("recent_searches", JSON.stringify(updated));
                                    }} className="ml-1 p-1">
                                        <X size={12} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    <View className="mt-10">
                        <Text className="text-lg font-bold text-gray-900 mb-5">지금 찾는 인기 검색어</Text>
                        <View className="flex-row flex-wrap">
                            {popularKeywords.map((item) => (
                                <TouchableOpacity key={item.rank} className="w-1/2 flex-row items-center mb-4 pr-2" onPress={() => onSearchSubmit(item.name)}>
                                    <Text className={`w-6 text-[15px] font-bold ${item.rank <= 3 ? 'text-blue-900' : 'text-gray-400'}`}>{item.rank}</Text>
                                    <Text className="text-[15px] font-medium text-gray-700 flex-1" numberOfLines={1}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}