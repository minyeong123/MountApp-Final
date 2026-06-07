import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, SafeAreaView, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { PenLine, Heart, MessageCircle, Star } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const BACKEND_URL = "http://10.0.2.2:8082";

const getSafeImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800";
    if (path.startsWith("http")) return path;
    const filename = path.split('\\').pop().split('/').pop();
    return `${BACKEND_URL}/uploads/${filename}`;
};

export default function Community() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [selectedTab, setSelectedTab] = useState("게시글");
    const [showMenu, setShowMenu] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            const response = await axios.get(`${BACKEND_URL}/api/posts`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const allData = response.data;
            setPosts(allData.filter(item => item.rating === 0).reverse());
            setReviews(allData.filter(item => item.rating > 0).reverse());
        } catch (error) {
            console.error("데이터 로드 에러:", error);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const renderItem = ({ item }) => {
        const isReview = item?.rating && item.rating > 0;

        return (
            <TouchableOpacity
                onPress={() => router.push({ pathname: "/community/[id]", params: { id: item.id } })}
                className="px-5 py-6 bg-white border-b border-gray-100"
            >
                <View className="flex-row items-start mb-4">
                    <View className="flex-1 mr-4">

                        {/* 1. 에러가 나던 View 영역: 내부 공백과 주석을 정리했습니다 */}
                        <View className="flex-row items-center mb-1.5">
                            <Text className="text-gray-400 text-[11px] mr-2">
                                {item.category || "일반"}
                            </Text>

                            {/* && 대신 삼항 연산자를 쓰고, [...Array(5)]로 안전하게 처리 */}
                            {isReview ? (
                                <View className="flex-row items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={11}
                                            color={i < Math.floor(item.rating) ? "#fbbf24" : "#d1d5db"}
                                            fill={i < Math.floor(item.rating) ? "#fbbf24" : "transparent"}
                                            style={{ marginRight: 1 }}
                                        />
                                    ))}
                                    <Text className="ml-1 text-[11px] font-bold text-amber-500">
                                        {Number(item.rating).toFixed(1)}
                                    </Text>
                                </View>
                            ) : null}
                        </View>

                        <Text className="font-bold text-gray-900 mb-1" numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text className="text-gray-500 text-[13px] leading-5" numberOfLines={2}>
                            {item.postContents || item.comment}
                        </Text>
                    </View>

                    {(item.imagePath || item.image_path || item.image) && (
                        <View className="w-20 h-20 rounded-xl mt-6 overflow-hidden bg-gray-100">
                            <Image
                                source={{ uri: getSafeImageUrl(item.imagePath || item.image_path || item.image) }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                    )}
                </View>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="flex-row items-center mr-3">
                            <Heart size={12} color="#9ca3af" fill={item.likeCount > 0 ? "#9ca3af" : "transparent"} />
                            <Text className="text-gray-400 text-[11px] ml-1">{item.likeCount || 0}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <MessageCircle size={12} color="#9ca3af" />
                            <Text className="text-gray-400 text-[11px] ml-1">1</Text>
                        </View>
                    </View>

                    <Text className="text-gray-400 text-[11px]">
                        {item.createdAt
                            ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ko })
                            : "방금 전"}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-5 py-5 border-b border-gray-100 shadow-sm">
                <Text className="text-xl font-black text-gray-900">커뮤니티</Text>
            </View>

            <View className="flex-row bg-white border-b border-gray-100 mb-1">
                {["게시글", "리뷰"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setSelectedTab(tab)}
                        className={`flex-1 py-3 items-center ${selectedTab === tab ? "border-b-2 border-emerald-500" : ""}`}
                    >
                        <Text className={`text-sm font-bold ${selectedTab === tab ? "text-emerald-600" : "text-gray-400"}`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={selectedTab === "게시글" ? posts : reviews}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* 배경 터치 시 메뉴 닫기 */}
            {showMenu && (
                <TouchableOpacity
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    onPress={() => setShowMenu(false)}
                    activeOpacity={1}
                />
            )}

            {/* 드롭다운 메뉴 */}
            {showMenu && (
                <View
                    style={{
                        position: 'absolute',
                        bottom: 90,
                        right: 24,
                        backgroundColor: 'white',
                        borderRadius: 16,
                        overflow: 'hidden',
                        minWidth: 140,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.12,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f3f4f6',
                        }}
                        onPress={() => {
                            setShowMenu(false);
                            router.push({ pathname: "/community/newpost", params: { type: "post" } });
                        }}
                    >
                        <PenLine size={16} color="#10b981" />
                        <Text style={{ marginLeft: 10, color: '#111827', fontSize: 14, fontWeight: '500' }}>게시글</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                        }}
                        onPress={() => {
                            setShowMenu(false);
                            router.push({ pathname: "/community/newpost", params: { type: "review" } });
                        }}
                    >
                        <Star size={16} color="#10b981" />
                        <Text style={{ marginLeft: 10, color: '#111827', fontSize: 14, fontWeight: '500' }}>리뷰</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* FAB 버튼 */}
            <TouchableOpacity
                className="absolute bottom-8 right-6 w-14 h-14 bg-emerald-500 rounded-full items-center justify-center shadow-lg shadow-emerald-300"
                onPress={() => setShowMenu(!showMenu)}
            >
                <PenLine color="white" size={24} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}