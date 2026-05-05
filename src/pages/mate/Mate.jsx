import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Search, Users, MapPin, Clock, Plus, MoreHorizontal, MessageCircleMore, Heart, MessageCircle, Share2, Trash2, User as UserIcon } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { useRouter } from 'expo-router';

const BACKEND_URL = "http://10.0.2.2:8082";

// 프로필 아바타 컴포넌트
const ProfileAvatar = ({ imagePath, nickname, size = "w-10 h-10" }) => {
    const [imgError, setImgError] = useState(false);

    const getProfileImageUrl = (path) => {
        if (!path || typeof path !== 'string') return null;
        if (path.startsWith("http")) return path;
        if (path.startsWith("/images/")) return `${BACKEND_URL}${path}`;
        const filename = path.split('\\').pop().split('/').pop();
        return `${BACKEND_URL}/uploads/${filename}`;
    };

    return (
        <View className={`${size} rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 items-center justify-center`}>
            {imagePath && !imgError ? (
                <Image
                    source={{ uri: getProfileImageUrl(imagePath) }}
                    className="w-full h-full"
                    onError={() => setImgError(true)}
                />
            ) : (
                <UserIcon size={20} color="#9ca3af" />
            )}
        </View>
    );
};

export default function Mate() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [mountains, setMountains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("전체");
    const [activeMenuId, setActiveMenuId] = useState(null);

    // 게시글 및 산 데이터 로드
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('jwtToken');
            const config = {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            };

            // 병렬 처리로 게시글과 산 목록 동시 호출
            const [postsRes, mtRes] = await Promise.all([
                axios.get(`${BACKEND_URL}/api/mates`, config),
                axios.get(`${BACKEND_URL}/api/mountains`, config).catch(() => ({ data: [] }))
            ]);

            setPosts(postsRes.data);
            setMountains(mtRes.data);
        } catch (error) {
            console.error("데이터 로드 실패:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 메인 이미지 로직 (업로드 사진 최우선, 없으면 산 DB 사진 매핑)
    const getMainImageUrl = (item) => {
        const isRealImage = (path) => {
            if (!path || typeof path !== 'string') return false;
            const lower = path.toLowerCase();
            return !(lower.includes('placeholder') || lower.includes('default') || lower === 'null');
        };

        // 1순위: 유저 업로드
        let userUploaded = null;
        if (item.imageUrl) userUploaded = typeof item.imageUrl === 'string' ? item.imageUrl.split(',')[0] : item.imageUrl[0];
        else if (item.imageUrls && item.imageUrls.length > 0) userUploaded = item.imageUrls[0];
        else if (item.images && item.images.length > 0) userUploaded = typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url;

        if (isRealImage(userUploaded)) {
            if (userUploaded.startsWith("http") && !userUploaded.includes("8082")) return userUploaded;
            const filename = userUploaded.split('\\').pop().split('/').pop();
            return `${BACKEND_URL}/uploads/${filename}`;
        }

        // 2순위: DB 산 목록 매칭
        const mtName = item.mountainName || (item.course?.name ? item.course.name.split(' ')[0] : "");

        if (mtName && mountains.length > 0) {
            const matched = mountains.find(m =>
                m.name === mtName || m.name.includes(mtName) || mtName.includes(m.name)
            );

            if (matched && isRealImage(matched.imageUrl)) {
                const rawPath = matched.imageUrl.split(',')[0];
                if (rawPath.startsWith("http") && !rawPath.includes("8082")) return rawPath;
                const filename = rawPath.split('\\').pop().split('/').pop();
                return `${BACKEND_URL}/images/${filename}`;
            }
        }

        // 3순위: 기본 배경
        return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop';
    };

    const getDifficultyStyle = (difficulty) => {
        if (!difficulty) return { label: '미정', bg: 'bg-gray-400' };
        if (difficulty.includes('상')) return { label: '상급', bg: 'bg-red-500' };
        if (difficulty.includes('중')) return { label: '중급', bg: 'bg-yellow-500' };
        if (difficulty.includes('하') || difficulty.includes('초')) return { label: '초급', bg: 'bg-[#3CD371]' };
        return { label: difficulty, bg: 'bg-gray-400' };
    };

    // 게시글 삭제 (모바일 알림창 대응)
    const handleDelete = async (id) => {
        Alert.alert(
            "삭제 확인",
            "정말 이 모임을 삭제하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제하기",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('jwtToken');
                            await axios.delete(`${BACKEND_URL}/api/mates/${id}`, {
                                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                            });
                            Alert.alert("알림", "삭제되었습니다.");
                            setActiveMenuId(null);
                            loadData(); // 삭제 후 리스트 갱신
                        } catch (error) {
                            Alert.alert("실패", "삭제에 실패했습니다. 권한을 확인해주세요.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 상단 헤더 */}
            <View className="px-4 py-3 bg-white border-b border-gray-50 mt-6 z-10">
                <View className="flex-row items-center space-x-3 mb-4">
                    <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 h-10">
                        <Search size={18} color="#9ca3af" />
                        <TextInput placeholder="어떤 산으로 떠나볼까요?" className="flex-1 ml-2 text-sm" />
                    </View>
                    <TouchableOpacity onPress={() => router.push('/mate/chat')}>
                        <MessageCircleMore size={26} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2">
                    {['전체', '오늘', '이번주', '주말', '초보'].map((tab, idx) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`px-5 py-1.5 rounded-full border ${activeTab === tab ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
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
                <ScrollView className="flex-1 bg-gray-50 pt-2">
                    {posts.length === 0 ? (
                        <View className="py-20 items-center">
                            <Text className="text-gray-400">아직 등록된 모임이 없습니다.</Text>
                            <Text className="text-gray-400">첫 번째 모임을 만들어보세요!</Text>
                        </View>
                    ) : (
                        posts.map((post) => (
                            <View key={post.id} className="bg-white mb-3 pt-5 px-4 pb-6 shadow-sm border-t-8 border-gray-50">
                                {/* 작성자 정보 및 더보기 메뉴 */}
                                <View className="flex-row justify-between items-center mb-4 relative z-20">
                                    <View className="flex-row items-center space-x-2.5">
                                        <ProfileAvatar imagePath={post.host?.profileImg} nickname={post.host?.name} />
                                        <View>
                                            <Text className="text-[14px] font-bold text-gray-800">{post.host?.name || "익명"}</Text>
                                            <Text className="text-[11px] text-gray-400 font-medium">방금 전</Text>
                                        </View>
                                    </View>

                                    <View>
                                        <TouchableOpacity onPress={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)} className="p-1">
                                            <MoreHorizontal size={20} color="#d1d5db" />
                                        </TouchableOpacity>

                                        {/* 삭제 메뉴 모달창 (Absolute 위치) */}
                                        {activeMenuId === post.id && (
                                            <View className="absolute right-0 top-8 bg-white w-28 rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                                <TouchableOpacity
                                                    className="flex-row items-center justify-center space-x-2 py-3 border-b border-gray-50"
                                                    onPress={() => handleDelete(post.id)}
                                                >
                                                    <Trash2 size={14} color="#ef4444" />
                                                    <Text className="text-red-500 text-[13px] font-bold">삭제하기</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity className="py-2.5 items-center" onPress={() => setActiveMenuId(null)}>
                                                    <Text className="text-gray-400 text-[12px]">취소</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* 산 이미지 및 라벨 영역 */}
                                <TouchableOpacity
                                    onPress={() => router.push(`/mate/${post.id}`)}
                                    className="rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-sm relative -mx-1"
                                >
                                    <Image source={{ uri: getMainImageUrl(post) }} className="w-full h-64" resizeMode="cover" />

                                    <View className="absolute top-4 left-4 flex-row space-x-2">
                                        <View className={`px-3 py-1 rounded-lg ${getDifficultyStyle(post.course?.difficulty).bg} shadow-lg`}>
                                            <Text className="text-white text-[11px] font-bold">{getDifficultyStyle(post.course?.difficulty).label}</Text>
                                        </View>
                                        <View className="bg-white/90 px-3 py-1 rounded-lg shadow-sm">
                                            <Text className="text-gray-800 text-[11px] font-bold">{post.deadline || "D-Day"}</Text>
                                        </View>
                                    </View>

                                    <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-full flex-row items-center">
                                        <Users size={12} color="white" />
                                        <Text className="text-white text-[11px] font-bold ml-1.5">{post.members?.current || 1}/{post.members?.max || 4}명 참여중</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* 액션 아이콘 및 내용 */}
                                <View className="px-1">
                                    <View className="flex-row justify-between items-center mb-4">
                                        <View className="flex-row space-x-5">
                                            <TouchableOpacity><Heart size={24} color="#374151" /></TouchableOpacity>
                                            <TouchableOpacity><MessageCircle size={24} color="#374151" /></TouchableOpacity>
                                            <TouchableOpacity><Share2 size={24} color="#374151" /></TouchableOpacity>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => router.push(`/mate/${post.id}`)}
                                            className="bg-[#F59E6D] px-5 py-2 rounded-full shadow-sm"
                                        >
                                            <Text className="text-white text-[13px] font-extrabold">자세히 보기</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text className="text-[19px] font-extrabold text-gray-900 leading-tight tracking-tight mb-2">{post.title}</Text>

                                    <View className="flex-row items-center space-x-4 mb-2">
                                        <View className="flex-row items-center">
                                            <MapPin size={14} color="#F59E6D" />
                                            <Text className="text-[#F59E6D] text-[13px] font-bold ml-1.5">{post.course?.distance || "거리 미상"}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Clock size={14} color="#F59E6D" />
                                            <Text className="text-[#F59E6D] text-[13px] font-bold ml-1.5">{post.course?.duration || "시간 미상"}</Text>
                                        </View>
                                    </View>

                                    <Text className="text-gray-600 text-[14px] leading-relaxed mb-3" numberOfLines={2}>
                                        {post.description} <Text className="text-gray-400">더보기</Text>
                                    </Text>

                                    {/* 태그 영역 */}
                                    {post.tags && post.tags.length > 0 && (
                                        <View className="flex-row flex-wrap mt-1">
                                            {post.tags.map((tag, idx) => (
                                                <View key={idx} className="bg-[#F0F7FF] px-2.5 py-1 rounded-md mr-2 mb-2">
                                                    <Text className="text-[#55ACEE] text-[12px] font-bold">
                                                        #{typeof tag === 'string' ? tag : tag.label}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))
                    )}

                    {/* 최하단 여백 및 아이콘 영역 */}
                    {posts.length > 0 && (
                        <View className="py-10 items-center opacity-60 mb-10">
                            <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mb-3">
                                <MapPin size={20} color="#9ca3af" />
                            </View>
                            <Text className="text-[13px] text-gray-500 font-medium text-center">
                                더 많은 등산 모임이 기다리고 있어요!{"\n"}원하는 산을 검색해보세요.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* 글쓰기 플로팅 버튼 */}
            <TouchableOpacity
                onPress={() => router.push('/mate/matecreate')}
                className="absolute bottom-10 right-6 bg-[#F59E6D] flex-row items-center px-6 h-12 rounded-full shadow-lg"
            >
                <Plus size={20} color="white" />
                <Text className="text-white font-bold ml-1.5">글쓰기</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}