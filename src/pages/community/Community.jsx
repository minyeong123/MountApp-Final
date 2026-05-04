import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert, Dimensions } from "react-native";
import { useRouter } from "expo-router"; //
import { Star, StarHalf, PenLine, Camera, CameraOff, Megaphone, ThumbsUp, User as UserIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");

// 🔥 에뮬레이터 연동 핵심: localhost 대신 10.0.2.2 사용
const BACKEND_URL = "http://10.0.2.2:8082";

// 이미지 경로 처리 함수 (Mate.jsx 스타일로 최적화)
const getSafeImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800";
    if (path.startsWith("http")) return path;

    // 파일명만 추출하여 서버 주소와 결합
    const filename = path.split('\\').pop().split('/').pop();
    return `${BACKEND_URL}/uploads/${filename}`;
};

// 프로필 아바타 컴포넌트
const ProfileAvatar = ({ imagePath, nickname, size = "w-6 h-6" }) => {
    const [imgError, setImgError] = useState(false);
    return (
        <View className={`${size} rounded-full bg-gray-200 overflow-hidden border border-gray-200 items-center justify-center`}>
            {imagePath && !imgError ? (
                <Image
                    source={{ uri: getSafeImageUrl(imagePath) }}
                    className="w-full h-full"
                    onError={() => setImgError(true)}
                />
            ) : (
                <UserIcon size={14} color="#9ca3af" />
            )}
        </View>
    );
};

export default function Community() {
    const router = useRouter(); //
    const [posts, setPosts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [loading, setLoading] = useState(false);
    const categories = ["전체", "산", "등산용품", "맛집", "숙소"];

    // 🔥 데이터 로드 로직
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("jwtToken");

            const response = await axios.get(`${BACKEND_URL}/api/posts`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            const allData = response.data;
            setPosts(allData.filter(item => (item.rating || 0) === 0).reverse());
            setReviews(allData.filter(item => (item.rating || 0) > 0).reverse());
        } catch (error) {
            console.error("데이터 로드 에러:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                Alert.alert("알림", "로그인이 필요한 서비스입니다.");
                router.push("/auth/LoginPage"); // 로그인 페이지 이동도 router로 변경 가능
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderStars = (rating) => {
        const score = Number(rating) || 0;
        const fullStars = Math.floor(score);
        const hasHalfStar = score - fullStars >= 0.5;

        return (
            <View className="flex-row items-center space-x-0.5">
                {[1, 2, 3, 4, 5].map(idx => {
                    if (idx <= fullStars) return <Star key={idx} size={10} color="#fbbf24" fill="#fbbf24" />;
                    if (idx === fullStars + 1 && hasHalfStar) return <StarHalf key={idx} size={10} color="#fbbf24" fill="#fbbf24" />;
                    return <Star key={idx} size={10} color="#d1d5db" />;
                })}
            </View>
        );
    };

    const filteredReviews = selectedCategory === "전체"
        ? reviews
        : reviews.filter(review => review.category === selectedCategory);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white py-4 items-center shadow-sm border-b border-gray-100 mt-4">
                <Text className="text-xl font-bold text-gray-900">커뮤니티</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

                {/* 1. 게시글 섹션 */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center space-x-3">
                            <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                                <Megaphone size={20} color="white" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900">게시글</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push("/community/newpost")}
                            className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center space-x-1"
                        >
                            <PenLine size={16} color="white" />
                            <Text className="text-white font-bold text-xs">글쓰기</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={252} decelerationRate="fast">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <TouchableOpacity
                                    key={post.id}
                                    onPress={() => router.push({ pathname: "/community/[id]", params: { id: post.id } })}
                                    className="w-[240px] bg-white rounded-2xl mr-3 overflow-hidden border border-gray-100 shadow-sm"
                                >
                                    <View className="h-28 bg-gray-200">
                                        {post.imagePath ? (
                                            <Image source={{ uri: getSafeImageUrl(post.imagePath) }} className="w-full h-full" />
                                        ) : (
                                            <View className="flex-1 items-center justify-center bg-blue-50">
                                                <CameraOff size={24} color="#bfdbfe" />
                                            </View>
                                        )}
                                    </View>
                                    <View className="p-3">
                                        <View className="flex-row items-center space-x-2 mb-2">
                                            <ProfileAvatar imagePath={post.profileImage} nickname={post.nickname} />
                                            <Text className="text-[10px] text-gray-500 font-medium">{post.nickname || "익명"}</Text>
                                        </View>
                                        <Text className="font-bold text-sm text-gray-900 mb-1" numberOfLines={1}>{post.title}</Text>
                                        <Text className="text-gray-500 text-[11px] leading-4 h-8" numberOfLines={2}>
                                            {post.comment || post.postContents}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="w-full py-10 items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300">
                                <Text className="text-gray-400 text-xs">등록된 게시글이 없습니다.</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* 2. 리뷰 섹션 */}
                <View className="mb-20">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center space-x-3">
                            <View className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center">
                                <ThumbsUp size={20} color="white" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900">리뷰</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: "/community/newpost", params: { type: "review" } })}
                            className="bg-emerald-600 px-4 py-2 rounded-full flex-row items-center space-x-1"
                        >
                            <Camera size={16} color="white" />
                            <Text className="text-white font-bold text-xs">리뷰 작성</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 카테고리 필터 */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full border mr-2 ${
                                    selectedCategory === cat ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-200"
                                }`}
                            >
                                <Text className={`text-xs font-bold ${selectedCategory === cat ? "text-white" : "text-gray-600"}`}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={252} decelerationRate="fast">
                        {filteredReviews.length > 0 ? (
                            filteredReviews.map((review, index) => (
                                <TouchableOpacity
                                    key={review.id || index}
                                    onPress={() => router.push({ pathname: "/community/[id]", params: { id: review.id } })}
                                    className="w-[240px] bg-white rounded-2xl mr-3 overflow-hidden border border-gray-100 shadow-sm"
                                >
                                    <View className="h-28 bg-gray-200">
                                        {review.imagePath ? (
                                            <Image source={{ uri: getSafeImageUrl(review.imagePath) }} className="w-full h-full" />
                                        ) : (
                                            <View className="flex-1 items-center justify-center">
                                                <CameraOff size={24} color="#d1d5db" />
                                            </View>
                                        )}
                                    </View>
                                    <View className="p-3">
                                        <View className="flex-row items-center space-x-2 mb-2">
                                            <ProfileAvatar imagePath={review.profileImage} nickname={review.nickname} />
                                            <Text className="text-[10px] text-gray-500 font-medium">{review.nickname || "익명"}</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center mb-1">
                                            <Text className="font-bold text-sm text-gray-900 flex-1 mr-2" numberOfLines={1}>{review.title}</Text>
                                            {renderStars(review.rating)}
                                        </View>
                                        <Text className="text-gray-500 text-[11px] leading-4 h-8" numberOfLines={2}>
                                            {review.postContents || review.comment}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="w-full py-10 items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300">
                                <Text className="text-gray-400 text-xs">'{selectedCategory}' 카테고리의 리뷰가 없습니다.</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}