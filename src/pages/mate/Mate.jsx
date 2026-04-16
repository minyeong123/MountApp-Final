import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, Alert, Dimensions } from 'react-native';
import { Search, Filter, Heart, MessageCircle, Share2, Users, MapPin, Clock, Plus, MoreHorizontal, Trash2, User, MessageCircleMore } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

const { width } = Dimensions.get('window');

// --- 프로필 이미지 컴포넌트 ---
const ProfileAvatar = ({ imagePath, nickname, size = "w-10 h-10" }) => {
    const API_BASE = 'http://YOUR_SERVER_IP:8080'; // 서버 IP로 수정

    const getProfileImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        const filename = path.split('\\').pop().split('/').pop();
        return `${API_BASE}/uploads/${filename}`;
    };

    const imageUrl = getProfileImageUrl(imagePath);

    return (
        <View className={`${size} rounded-full bg-gray-100 overflow-hidden border border-gray-200 items-center justify-center`}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} className="w-full h-full" />
            ) : (
                <User size={20} color="#9ca3af" />
            )}
        </View>
    );
};

export default function Mate({ navigation }) {
    const [posts, setPosts] = useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const API_BASE = 'http://YOUR_SERVER_IP:8080'; // 본인 PC IP 주소

    // 1. 게시글 데이터 로드
    const loadPosts = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('jwtToken');
            const response = await axios.get(`${API_BASE}/api/mates`, {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });
            setPosts(response.data);
        } catch (error) {
            console.error("게시글 로드 실패:", error);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    // 2. 메인 이미지 처리 (서버 IP 연결)
    const getMainImageUrl = (post) => {
        let path = post.imageUrl || (post.images && post.images[0]?.url);
        if (!path) return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800';

        if (path.startsWith("http")) return path;
        const filename = path.split('\\').pop().split('/').pop();
        return `${API_BASE}/uploads/${filename}`;
    };

    // 3. 난이도 스타일
    const getDifficultyStyle = (difficulty) => {
        if (!difficulty) return { label: '미정', bg: 'bg-gray-400' };
        if (difficulty.includes('상')) return { label: '상급', bg: 'bg-red-500' };
        if (difficulty.includes('중')) return { label: '중급', bg: 'bg-yellow-500' };
        return { label: '초급', bg: 'bg-green-500' };
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 섹션 */}
            <View className="px-4 py-3 bg-white border-b border-gray-50">
                <View className="flex-row items-center space-x-3 mb-4">
                    <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 h-10">
                        <Search size={18} color="#9ca3af" />
                        <TextInput
                            placeholder="어떤 산으로 떠나볼까요?"
                            className="flex-1 ml-2 text-sm"
                        />
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
                        <MessageCircleMore size={26} color="#6b7280" />
                        <View className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2">
                    <TouchableOpacity className="p-2 border border-gray-200 rounded-lg bg-white">
                        <Filter size={16} color="#4b5563" />
                    </TouchableOpacity>
                    {['전체', '오늘', '이번주', '주말', '초보'].map((tab, idx) => (
                        <TouchableOpacity
                            key={tab}
                            className={`px-5 py-2 rounded-full border ${idx === 1 ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`text-xs font-bold ${idx === 1 ? 'text-white' : 'text-gray-500'}`}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 피드 리스트 */}
            <ScrollView className="flex-1 bg-gray-50">
                {posts.map((post) => (
                    <View key={post.id} className="bg-white mb-3 pt-5 px-4 pb-6">
                        {/* 작성자 정보 */}
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <ProfileAvatar imagePath={post.host?.profileImg} nickname={post.host?.name} />
                                <View className="ml-3">
                                    <Text className="text-sm font-bold text-gray-800">{post.host?.name || "익명"}</Text>
                                    <Text className="text-[10px] text-gray-400">방금 전</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setActiveMenuId(post.id)}>
                                <MoreHorizontal size={20} color="#d1d5db" />
                            </TouchableOpacity>
                        </View>

                        {/* 포스트 카드 */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('MateDetail', { id: post.id })}
                            className="rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-sm"
                        >
                            <Image
                                source={{ uri: getMainImageUrl(post) }}
                                className="w-full h-60"
                                resizeMode="cover"
                            />
                            <View className="absolute top-4 left-4 flex-row space-x-2">
                                <View className={`px-3 py-1 rounded-lg ${getDifficultyStyle(post.course?.difficulty).bg}`}>
                                    <Text className="text-white text-[10px] font-bold">{getDifficultyStyle(post.course?.difficulty).label}</Text>
                                </View>
                                <View className="bg-white/90 px-3 py-1 rounded-lg">
                                    <Text className="text-gray-800 text-[10px] font-bold">{post.deadline || "D-Day"}</Text>
                                </View>
                            </View>
                            <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-full flex-row items-center">
                                <Users size={12} color="white" />
                                <Text className="text-white text-[10px] font-bold ml-1">{post.members?.current || 1}/{post.members?.max || 4}명</Text>
                            </View>
                        </TouchableOpacity>

                        {/* 액션 버튼 & 텍스트 */}
                        <View className="flex-row justify-between items-center mb-4 px-1">
                            <View className="flex-row space-x-5">
                                <Heart size={24} color="#374151" />
                                <MessageCircle size={24} color="#374151" />
                                <Share2 size={24} color="#374151" />
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('MateDetail', { id: post.id })}
                                className="bg-orange-400 px-5 py-2.5 rounded-full shadow-md"
                            >
                                <Text className="text-white text-[13px] font-black">자세히 보기</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="px-1">
                            <Text className="text-[18px] font-black leading-tight mb-2">{post.title}</Text>
                            <View className="flex-row space-x-4 mb-3">
                                <View className="flex-row items-center">
                                    <MapPin size={14} color="#fb923c" />
                                    <Text className="text-[#fb923c] text-[12px] font-bold ml-1">{post.course?.distance || "미상"}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Clock size={14} color="#fb923c" />
                                    <Text className="text-[#fb923c] text-[12px] font-bold ml-1">{post.course?.duration || "미상"}</Text>
                                </View>
                            </View>
                            <Text className="text-gray-600 text-sm leading-5 mb-3" numberOfLines={2}>
                                {post.description}
                            </Text>
                            <View className="flex-row flex-wrap">
                                {post.tags && post.tags.map((tag, idx) => (
                                    <View key={idx} className="bg-blue-50 px-2.5 py-1 rounded-md mr-2 mb-2">
                                        <Text className="text-blue-400 text-[11px] font-bold">#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* 글쓰기 버튼 */}
            <TouchableOpacity
                onPress={() => navigation.navigate('Create')}
                className="absolute bottom-10 right-6 bg-orange-400 flex-row items-center px-6 h-12 rounded-full shadow-lg"
            >
                <Plus size={20} color="white" />
                <Text className="text-white font-bold ml-2">글쓰기</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}