import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { Search, Users, MapPin, Clock, Plus, MoreHorizontal, MessageCircleMore } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { useRouter } from 'expo-router'; // useRouter 임포트 확인

const BACKEND_URL = "http://10.0.2.2:8082";

export default function Mate() { // navigation 인자 제거
    const router = useRouter(); // router 객체 생성
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("전체");

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('jwtToken');
            const config = {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            };
            const response = await axios.get(`${BACKEND_URL}/api/mates`, config);
            setPosts(response.data);
        } catch (error) {
            console.error("데이터 로드 실패:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const getSafeImage = (path) => {
        if (!path) return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800';
        if (path.startsWith("http")) return path;
        return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const getDifficultyStyle = (difficulty) => {
        const diff = difficulty || '미정';
        if (diff.includes('상')) return { label: '상급', bg: 'bg-red-500' };
        if (diff.includes('중')) return { label: '중급', bg: 'bg-yellow-500' };
        return { label: '초급', bg: 'bg-green-500' };
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 상단 헤더 */}
            <View className="px-4 py-3 bg-white border-b border-gray-50 mt-6">
                <View className="flex-row items-center space-x-3 mb-4">
                    <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 h-10">
                        <Search size={18} color="#9ca3af" />
                        <TextInput placeholder="어떤 산으로 떠나볼까요?" className="flex-1 ml-2 text-sm" />
                    </View>
                    {/* 채팅 이동 수정 */}
                    <TouchableOpacity onPress={() => router.push('/mate/chat')}>
                        <MessageCircleMore size={26} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2">
                    {['전체', '오늘', '이번주', '주말', '초보'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-full border ${activeTab === tab ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#fb923c" />
                </View>
            ) : (
                <ScrollView className="flex-1 bg-gray-50">
                    {posts.length === 0 ? (
                        <View className="py-20 items-center">
                            <Text className="text-gray-400">등록된 게시글이 없습니다.</Text>
                        </View>
                    ) : (
                        posts.map((post) => (
                            <View key={post.id} className="bg-white mb-3 pt-5 px-4 pb-6 shadow-sm">
                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                            <Image source={{ uri: getSafeImage(post.host?.profileImg) }} className="w-full h-full" />
                                        </View>
                                        <View className="ml-3">
                                            <Text className="text-sm font-bold text-gray-800">{post.host?.name || "익명"}</Text>
                                            <Text className="text-[10px] text-gray-400">방금 전</Text>
                                        </View>
                                    </View>
                                    <MoreHorizontal size={20} color="#d1d5db" />
                                </View>

                                {/* 사진 클릭 시 상세 페이지([id].jsx)로 이동 - 경로 수정 핵심 */}
                                <TouchableOpacity
                                    onPress={() => router.push(`/mate/${post.id}`)}
                                    className="rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-sm"
                                >
                                    <Image source={{ uri: getSafeImage(post.imageUrl) }} className="w-full h-60" />
                                    <View className="absolute top-4 left-4 flex-row space-x-2">
                                        <View className={`px-3 py-1 rounded-lg ${getDifficultyStyle(post.course?.difficulty).bg}`}>
                                            <Text className="text-white text-[10px] font-bold">{getDifficultyStyle(post.course?.difficulty).label}</Text>
                                        </View>
                                    </View>
                                    <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-full flex-row items-center">
                                        <Users size={12} color="white" />
                                        <Text className="text-white text-[10px] font-bold ml-1">{post.members?.current || 1}/{post.members?.max || 4}명</Text>
                                    </View>
                                </TouchableOpacity>

                                <View className="px-1">
                                    <Text className="text-[18px] font-black text-gray-900 mb-2">{post.title}</Text>
                                    <View className="flex-row space-x-4 mb-3">
                                        <View className="flex-row items-center">
                                            <MapPin size={14} color="#fb923c" />
                                            <Text className="text-[#fb923c] text-[12px] font-bold ml-1">{post.course?.distance || "거리 미상"}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Clock size={14} color="#fb923c" />
                                            <Text className="text-[#fb923c] text-[12px] font-bold ml-1">{post.course?.duration || "시간 미상"}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-gray-600 text-sm leading-5 mb-3" numberOfLines={2}>
                                        {post.description}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* 글쓰기 버튼 이동 수정 */}
            <TouchableOpacity
                onPress={() => router.push('/mate/matecreate')}
                className="absolute bottom-10 right-6 bg-orange-400 flex-row items-center px-6 h-12 rounded-full shadow-lg"
            >
                <Plus size={20} color="white" />
                <Text className="text-white font-bold ml-2">글쓰기</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}