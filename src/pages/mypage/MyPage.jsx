import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { ChevronRight, FileText, Heart, MessageSquare, ThumbsUp, User as UserIcon, Clock, Move, Flame, HeartPulse } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendMessage } from 'react-native-wear-connectivity';
// [추가] 등산 기록 카드 컴포넌트
const HikingRecordCard = ({ record }) => (
    <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm">
        <View className="flex-row gap-3">
            {/* 왼쪽 지도 이미지 영역 */}
            <View className="w-[100px] h-[100px] rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                {record.mapImage ? (
                    <Image source={{ uri: record.mapImage }} className="w-full h-full" />
                ) : (
                    <View className="w-full h-full items-center justify-center bg-gray-50">
                        <Text className="text-[10px] text-gray-400">지도 없음</Text>
                    </View>
                )}
            </View>

            {/* 오른쪽 등산 정보 요약 */}
            <View className="flex-1 justify-between">
                <View className="flex-row justify-between items-start">
                    <Text className="text-base font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>
                        {record.mountainName} ({record.courseName})
                    </Text>
                    <View className="px-2 py-0.5 rounded-full bg-emerald-50">
                        <Text className="text-[11px] font-bold text-emerald-600">완료</Text>
                    </View>
                </View>
                <Text className="text-xs text-gray-400 mt-1">{record.date}</Text>

                {/* 4분할 디테일 지표 그리드 */}
                <View className="flex-row gap-1 mt-3">
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-1.5 items-center justify-center">
                        <Clock size={12} color="#10B981" />
                        <Text className="text-[8px] text-gray-400 mt-0.5">운동 시간</Text>
                        <Text className="text-[10px] font-bold text-gray-800 mt-0.5" numberOfLines={1}>{record.duration}</Text>
                    </View>
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-1.5 items-center justify-center">
                        <Move size={12} color="#3B82F6" />
                        <Text className="text-[8px] text-gray-400 mt-0.5">이동 거리</Text>
                        <Text className="text-[10px] font-bold text-gray-800 mt-0.5" numberOfLines={1}>{record.distance}km</Text>
                    </View>
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-1.5 items-center justify-center">
                        <Flame size={12} color="#F59E0B" />
                        <Text className="text-[8px] text-gray-400 mt-0.5">{record.stat3Name}</Text>
                        <Text className="text-[10px] font-bold text-gray-800 mt-0.5" numberOfLines={1}>{record.stat3Value}</Text>
                    </View>
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-1.5 items-center justify-center">
                        <HeartPulse size={12} color="#EF4444" />
                        <Text className="text-[8px] text-gray-400 mt-0.5">{record.stat4Name}</Text>
                        <Text className="text-[10px] font-bold text-gray-800 mt-0.5" numberOfLines={1}>{record.stat4Value}km</Text>
                    </View>
                </View>
            </View>
        </View>
    </View>
);

const PostCard = ({ post, onClick }) => (
    <TouchableOpacity
        onPress={() => onClick(post.id, post.type)}
        className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
    >
        <View className="flex-row justify-between items-start mb-2">
            <View className={`px-2 py-1 rounded-full ${post.type === 'REVIEW' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                <Text className={`text-[10px] font-bold ${post.type === 'REVIEW' ? 'text-blue-600' : 'text-gray-600'}`}>
                    {post.type === 'REVIEW' ? '리뷰' : '자유게시판'}
                </Text>
            </View>
            <Text className="text-xs text-gray-400">{post.date}</Text>
        </View>
        <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>{post.title}</Text>
        <Text className="text-sm text-gray-500 mb-3 leading-5 h-10" numberOfLines={2}>
            {post.content}
        </Text>
        <View className="flex-row items-center gap-3 border-t border-gray-100 pt-3">
            <View className="flex-row items-center gap-1">
                <ThumbsUp size={14} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs">{post.likes}</Text>
            </View>
            <View className="flex-row items-center gap-1">
                <MessageSquare size={14} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs">{post.comments}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

export default function MyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");
    const [hikingTab, setHikingTab] = useState("ALL"); // [추가] 등산 기록 필터 탭 상태
    const [myPosts, setMyPosts] = useState([]);

    // [추가] 이미지 기반 등산기록 더미 데이터 (추후 API 연동 대체 가능)
    const [hikingRecords, setHikingRecords] = useState([
        {
            id: 1,
            mountainName: "북한산",
            courseName: "백운대 코스",
            date: "2023. 10. 24일",
            duration: "01:12",
            distance: "12.5",
            stat3Name: "칼로리",
            stat3Value: "126",
            stat4Name: "심박수",
            stat4Value: "4.2",
            mapImage: "https://via.placeholder.com/150", // 실제 지도 데이터 URL 매핑 필요
            period: "THIS_MONTH" // 예시용 기간 태그
        },
        {
            id: 2,
            mountainName: "관악산",
            courseName: "연주대 코스",
            date: "2023. 10. 20일",
            duration: "03:21",
            distance: "4.3",
            stat3Name: "칼로리",
            stat3Value: "136",
            stat4Name: "심박수",
            stat4Value: "4.2",
            mapImage: "https://via.placeholder.com/150",
            period: "THIS_MONTH"
        },
    ]);

    const [user, setUser] = useState({
        name: "",
        email: "",
        userid: "",
        profileImage: null,
        stats: { point: 0, like: 0 },
    });

    const BACKEND_URL = "http://10.0.2.2:8082";

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) {
                setLoading(false);
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };

            const [userRes, countRes, likeCountRes, postsRes] = await Promise.all([
                axios.get(`${BACKEND_URL}/api/auth/me`, { headers }),
                axios.get(`${BACKEND_URL}/api/posts/my/count`, { headers }),
                axios.get(`${BACKEND_URL}/api/likes/my/count`, { headers }),
                axios.get(`${BACKEND_URL}/api/posts/my`, { headers })
            ]);

            const mappedPosts = postsRes.data.map(post => ({
                id: post.id,
                type: post.rating > 0 ? 'REVIEW' : 'POST',
                title: post.title,
                content: post.comment || post.content,
                date: post.postdate ? post.postdate.split(' ')[0] : '',
                likes: post.likeCount || 0,
                comments: post.commentCount || 0
            }));

            setMyPosts(mappedPosts);
            setUser({
                name: userRes.data.nickname || userRes.data.name,
                email: userRes.data.email,
                userid: userRes.data.userid,
                profileImage: userRes.data.profileImage,
                stats: { point: countRes.data, like: likeCountRes.data }
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostClick = (id, type) => {
        if (type === 'REVIEW') {
            router.push(`/review/${id}`);
        } else {
            router.push(`/post/${id}`);
        }
    };

    const handleLogout = async () => {
        Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
            { text: "취소", style: "cancel" },
            {
                text: "확인",
                onPress: async () => {
                    await AsyncStorage.removeItem("jwtToken");
                    router.replace('/');
                    sendMessage(
                        {
                            path: '/clear_jwt_token', // 삭제 전용 경로
                            data: 'logout'
                        },
                        (match) => console.log("✅ 워치 토큰 삭제 신호 전송 성공!"),
                        (err) => console.error("❌ 워치 신호 전송 실패:", err)
                    );
                }

            }
        ]);

    };

    const filteredPosts = myPosts.filter(post => activeTab === 'ALL' || post.type === activeTab);

    const filteredHikingRecords = hikingRecords.filter(record => {
        if (hikingTab === 'ALL') return true;
        if (hikingTab === 'THIS_MONTH') return record.period === 'THIS_MONTH';
        if (hikingTab === 'LAST_MONTH') return record.period === 'LAST_MONTH';
        return true;
    });

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#15803d" />
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <View className="pt-12 pb-4 items-center border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-900">마이페이지</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* 사용자 프로필 섹션 */}
                <View className="px-5 py-6 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center overflow-hidden border border-gray-200">
                            {user.profileImage ? (
                                <Image source={{ uri: `${BACKEND_URL}${user.profileImage}` }} className="w-full h-full" />
                            ) : (
                                <UserIcon size={32} color="#9CA3AF" />
                            )}
                        </View>
                        <View>
                            <Text className="text-lg font-bold text-gray-900">{user.name || "사용자"}</Text>
                            <Text className="text-xs text-gray-500">{user.email || "이메일 정보 없음"}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/mypage/profile')}
                        className="flex-row items-center px-3 py-2 border border-gray-200 rounded-full"
                    >
                        <Text className="text-xs text-gray-600 mr-1">수정</Text>
                        <ChevronRight size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* 통계 스코어보드 */}
                <View className="flex-row px-5 gap-3 mb-6">
                    <View className="flex-1 bg-gray-50 p-4 rounded-2xl flex-row justify-between items-center">
                        <View>
                            <Text className="text-[10px] text-gray-400 font-bold mb-1">게시글/리뷰</Text>
                            <Text className="text-xl font-black text-gray-900">{user.stats.point}</Text>
                        </View>
                        <FileText size={20} color="#4B5563" />
                    </View>
                    <View className="flex-1 bg-gray-50 p-4 rounded-2xl flex-row justify-between items-center">
                        <View>
                            <Text className="text-[10px] text-gray-400 font-bold mb-1">좋아요</Text>
                            <Text className="text-xl font-black text-gray-900">{user.stats.like}</Text>
                        </View>
                        <Heart size={20} color="#4B5563" />
                    </View>
                </View>

                <View className="h-2 bg-gray-50 mb-6" />

                <View className="px-5 mb-4">
                    <Text className="text-lg font-bold text-gray-900 mb-4">나의 등산 기록</Text>

                    {/* 등산 기록 탭 필터 필터 */}
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row gap-2">
                            {[
                                { id: 'ALL', label: '전체' },
                                { id: 'THIS_MONTH', label: '이번 달' },
                                { id: 'LAST_MONTH', label: '지난 달' }
                            ].map((tab) => (
                                <TouchableOpacity
                                    key={tab.id}
                                    onPress={() => setHikingTab(tab.id)}
                                    className={`px-4 py-2 rounded-full ${hikingTab === tab.id ? "bg-gray-900" : "bg-gray-100"}`}
                                >
                                    <Text className={`text-xs font-bold ${hikingTab === tab.id ? "text-white" : "text-gray-500"}`}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* 산별 보기 드롭다운 버튼 모양 유지 */}
                        <TouchableOpacity className="flex-row items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                            <Text className="text-xs text-gray-600 mr-1 font-semibold">산별 보기</Text>
                            <Text className="text-[10px] text-gray-500">▼</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 등산 기록 리스트 렌더링 */}
                    {filteredHikingRecords.length > 0 ? (
                        filteredHikingRecords.map((record) => (
                            <HikingRecordCard key={record.id} record={record} />
                        ))
                    ) : (
                        <View className="items-center justify-center py-10 bg-gray-50 rounded-2xl">
                            <Text className="text-gray-400 text-sm">기록된 등산 내역이 없습니다.</Text>
                        </View>
                    )}
                </View>

                <View className="h-2 bg-gray-50 my-6" />
                {/* ================================================================= */}

                {/* 기존 내 활동 내역 섹션 */}
                <View className="px-5 mb-4">
                    <Text className="text-lg font-bold text-gray-900 mb-4">내 활동 내역</Text>
                    <View className="flex-row gap-2">
                        {['ALL', 'POST', 'REVIEW'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full ${activeTab === tab ? "bg-gray-900" : "bg-gray-100"}`}
                            >
                                <Text className={`text-xs font-bold ${activeTab === tab ? "text-white" : "text-gray-500"}`}>
                                    {tab === 'ALL' ? '전체' : tab === 'POST' ? '게시글' : '리뷰'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 게시글 리스트 */}
                <View className="px-5 pb-10">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <PostCard key={post.id} post={post} onClick={handlePostClick} />
                        ))
                    ) : (
                        <View className="items-center justify-center py-20">
                            <FileText size={40} color="#E5E7EB" />
                            <Text className="text-gray-400 mt-2">작성된 내역이 없습니다.</Text>
                        </View>
                    )}
                </View>

                {/* 하단 시스템12 메뉴 */}
                <View className="px-5 mb-10 gap-3">
                    <TouchableOpacity onPress={handleLogout} className="w-full py-4 bg-white border border-gray-200 rounded-2xl items-center">
                        <Text className="font-bold text-gray-700">로그아웃</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert("회원 탈퇴", "정말 탈퇴하시겠습니까?")} className="items-center py-2">
                        <Text className="text-xs text-gray-400 underline">계정 탈퇴하기</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}