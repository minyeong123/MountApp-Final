import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import { ChevronLeft, X, MapPin } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router"; // 💡 추가

export default function SearchResultPage() {
    const { q } = useLocalSearchParams(); // 💡 검색어 받아오기
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(q || "");
    const [activeTab, setActiveTab] = useState("전체");

    const tabs = ["전체", "산", "코스", "게시글", "리뷰", "메이트"];

    const MountainSection = () => (
        <View className="mb-8">
            <Text className="font-bold text-lg mb-4 text-gray-900">산 <Text className="text-blue-600">1</Text></Text>
            <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <View className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden">
                    <Image source={{ uri: "https://via.placeholder.com/100" }} className="w-full h-full" resizeMode="cover" />
                </View>
                <View className="flex-1 ml-4">
                    <Text className="font-bold text-[17px] text-gray-900">{searchQuery}</Text>
                    <Text className="text-sm text-gray-500 mt-1">836m · 경기 고양시</Text>
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
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 pt-2 pb-4 border-b border-gray-100 mt-6">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
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

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5">
                    {tabs.map(tab => (
                        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`mr-6 pb-2 ${activeTab === tab ? "border-b-2 border-blue-900" : ""}`}>
                            <Text className={`text-[15px] font-bold ${activeTab === tab ? "text-blue-900" : "text-gray-400"}`}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {activeTab === "전체" || activeTab === "산" ? <MountainSection /> : null}
                {activeTab === "전체" || activeTab === "코스" ? <CourseSection /> : null}
            </ScrollView>
        </SafeAreaView>
    );
}