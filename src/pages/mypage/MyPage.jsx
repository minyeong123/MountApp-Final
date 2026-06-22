import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { ChevronRight, FileText, Heart, MessageSquare, ThumbsUp, User as UserIcon, Clock, Move, Flame, HeartPulse } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendMessage } from 'react-native-wear-connectivity';

const formatTime = (totalSeconds) => {
    if (!totalSeconds) return "00:00:00";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const HikingRecordCard = ({ record }) => (
    <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm">
        <View className="flex-row gap-3">
            <View className="w-[100px] h-[100px] rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                {record.mapImage ? (
                    <Image source={{ uri: record.mapImage }} className="w-full h-full" />
                ) : (
                    <View className="w-full h-full items-center justify-center bg-gray-50">
                        <Text className="text-[10px] text-gray-400">지도 없음</Text>
                    </View>
                )}
            </View>
            <View className="flex-1 justify-between">
                <View className="flex-row justify-between items-start">
                    <Text className="text-base font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>
                        {record.mountainName}
                    </Text>
                    <View className="px-2 py-0.5 rounded-full bg-emerald-50">
                        <Text className="text-[11px] font-bold text-emerald-600">완료</Text>
                    </View>
                </View>
                <Text className="text-xs text-gray-400 mt-1">{record.date}</Text>
                <View className="flex-row gap-1 mt-3">
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-1.5 items-center justify-center">
                        <Clock size={12} color="#10B981" />
                        <Text className="text-[8px] text-gray-400 mt-0.5">운동 시간</Text>
                        <Text className="text-[10px] font-bold text-gray-800 mt-0.5" numberOfLines={1}>{record.duration}</Text>
                    </View>
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-1.5 items-center justify-center">
                        <Move size={12} color="#3B82F6" />
                        <Text className="text-[8px] text-gray-400 mt-0.5">이동 거리</Text>
                        <Text className="text-[10px] font-bold text-gray-800 mt-0.5" numberOfLines={1}>{record.distance}</Text>
                    </View>
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-1.5 items-center justify-center">
                        <Flame size={12} color="#F59E0B" />
                        <Text className="text-[8px] text-gray-400 mt-0.5">{record.stat3Name}</Text>
                        <Text className="text-[10px] font-bold text-gray-800 mt-0.5" numberOfLines={1}>{record.stat3Value}</Text>
                    </View>
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-1.5 items-center justify-center">
                        <HeartPulse size={12} color="#EF4444" />
                        <Text className="text-[8px] text-gray-400 mt-0.5">{record.stat4Name}</Text>
                        <Text className="text-[10px] font-bold text-gray-800 mt-0.5" numberOfLines={1}>{record.stat4Value}</Text>
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

const HIKING_RECORDS_LIMIT = 3;

// ✅ 고정 산 목록 (6개)
const FIXED_MOUNTAINS = ['북한산', '설악산', '지리산', '한라산', '내장산'];

export default function MyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");
    const [hikingTab, setHikingTab] = useState("ALL");
    const [myPosts, setMyPosts] = useState([]);
    const [selectedMountain, setSelectedMountain] = useState('ALL');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [hikingRecords, setHikingRecords] = useState([]);
    const [showAllHikingRecords, setShowAllHikingRecords] = useState(false);

    // ✅ 고정 6개 산 목록 (ALL 포함)
    const mountainList = ['ALL', ...FIXED_MOUNTAINS];

    const [user, setUser] = useState({
        name: "",
        email: "",
        userid: "",
        profileImage: null,
        stats: { point: 0, like: 0 },
    });

    const BACKEND_URL = "http://10.0.2.2:8082";

    const fetchUserInfo = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) {
                setLoading(false);
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };

            const [userRes, countRes, likeCountRes, postsRes, hikingRes] = await Promise.all([
                axios.get(`${BACKEND_URL}/api/auth/me`, { headers }),
                axios.get(`${BACKEND_URL}/api/posts/my/count`, { headers }),
                axios.get(`${BACKEND_URL}/api/likes/my/count`, { headers }),
                axios.get(`${BACKEND_URL}/api/posts/my`, { headers }),
                axios.get(`${BACKEND_URL}/api/health/workout-summary/my`, { headers }).catch(() => ({ data: [] }))
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

            const mappedHiking = (hikingRes.data || []).map((record, index) => {
                let periodType = "ALL";
                const recordDateStr = record.createdAt || "";

                if (recordDateStr) {
                    const now = new Date();
                    const currentYear = now.getFullYear();
                    const currentMonth = now.getMonth() + 1;
                    const thisMonthFilter = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
                    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                    const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                    const lastMonthFilter = `${lastYear}-${String(lastMonth).padStart(2, '0')}`;

                    if (recordDateStr.includes(thisMonthFilter)) {
                        periodType = "THIS_MONTH";
                    } else if (recordDateStr.includes(lastMonthFilter)) {
                        periodType = "LAST_MONTH";
                    }
                }

                const formattedDate = recordDateStr ? recordDateStr.split('T')[0].replace(/-/g, '. ') : "등산 완료";

                return {
                    id: record.id || index,
                    mountainName: record.trailName || "이름 없는 코스",
                    courseName: "코스",
                    date: formattedDate,
                    duration: formatTime(record.totalTimeSeconds),
                    distance: record.totalDistance !== undefined ? `${record.totalDistance.toFixed(1)}km` : "0.0km",
                    stat3Name: "칼로리",
                    stat3Value: record.totalCalories !== undefined ? `${record.totalCalories}kcal` : "0kcal",
                    stat4Name: "평균심박",
                    stat4Value: record.avgHeartRate !== undefined ? `${record.avgHeartRate}bpm` : "0bpm",
                    mapImage: null,
                    period: periodType
                };
            });

            setMyPosts(mappedPosts);
            setHikingRecords(mappedHiking);
            setUser({
                name: userRes.data.nickname || userRes.data.name,
                email: userRes.data.email,
                userid: userRes.data.userid,
                profileImage: userRes.data.profileImage,
                stats: { point: countRes.data, like: likeCountRes.data }
            });
        } catch (error) {
            console.error("마이페이지 데이터 조회 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const handlePostClick = (id, type) => {
        router.push(`/community/${id}`);
    };

    const handleLogout = async () => {
        Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
            { text: "취소", style: "cancel" },
            {
                text: "확인",
                onPress: async () => {
                    await AsyncStorage.removeItem("jwtToken");
                    router.replace('/');
                    sendMessage({ path: '/clear_jwt_token', data: 'logout' }, () => console.log("✅ 워치 토큰 삭제 완료"), (err) => console.error("❌ 워치 신호 전송 실패:", err));
                }
            }
        ]);
    };

    const filteredPosts = myPosts.filter(post => activeTab === 'ALL' || post.type === activeTab);

    // ✅ 필터 로직: includes로 산 이름이 포함된 모든 코스 필터링
    const filteredHikingRecords = hikingRecords.filter(record => {
        const tabMatch = hikingTab === 'ALL' || record.period === hikingTab;
        const mountainMatch = selectedMountain === 'ALL' || record.mountainName.includes(selectedMountain);
        return tabMatch && mountainMatch;
    });

    // ✅ 산 필터 변경 시 더보기 상태 초기화
    const handleSelectMountain = (name) => {
        setSelectedMountain(name);
        setDropdownOpen(false);
        setShowAllHikingRecords(false);
    };

    const visibleHikingRecords = showAllHikingRecords ? filteredHikingRecords : filteredHikingRecords.slice(0, HIKING_RECORDS_LIMIT);
    const hasMoreHikingRecords = filteredHikingRecords.length > HIKING_RECORDS_LIMIT;

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#15803d" />
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <View className="pt-5 pb-4 px-5 border-b border-gray-50 flex-row justify-between items-center bg-white">
                <Text className="text-xl font-black text-gray-900">마이페이지</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
                    <TouchableOpacity onPress={() => router.push('/mypage/profile')} className="flex-row items-center px-3 py-2 border border-gray-200 rounded-full">
                        <Text className="text-xs text-gray-600 mr-1">수정</Text>
                        <ChevronRight size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

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

                        <View style={{ position: 'relative' }}>
                            <TouchableOpacity
                                onPress={() => setDropdownOpen(!dropdownOpen)}
                                className="flex-row items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                            >
                                <Text className="text-xs text-gray-600 mr-1 font-semibold">
                                    {selectedMountain === 'ALL' ? '산별 보기' : selectedMountain}
                                </Text>
                                <Text className="text-[10px] text-gray-500">{dropdownOpen ? '▲' : '▼'}</Text>
                            </TouchableOpacity>

                            {dropdownOpen && (
                                <View className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-32 overflow-hidden">
                                    <ScrollView style={{ maxHeight: 200 }}>
                                        {mountainList.map((name) => (
                                            <TouchableOpacity
                                                key={name}
                                                onPress={() => handleSelectMountain(name)}
                                                className={`px-4 py-3 border-b border-gray-100 ${selectedMountain === name ? 'bg-emerald-50' : 'bg-white'}`}
                                            >
                                                <Text className={`text-xs ${selectedMountain === name ? 'text-emerald-700 font-bold' : 'text-gray-700'}`}>
                                                    {name === 'ALL' ? '전체 산' : name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>

                    {visibleHikingRecords.length > 0 ? (
                        <>
                            {visibleHikingRecords.map((record) => (
                                <HikingRecordCard key={record.id} record={record} />
                            ))}

                            {hasMoreHikingRecords && (
                                <TouchableOpacity
                                    onPress={() => setShowAllHikingRecords(prev => !prev)}
                                    className="w-full py-3 mt-1 mb-2 bg-gray-50 border border-gray-200 rounded-2xl items-center flex-row justify-center gap-1"
                                >
                                    <Text className="text-xs font-bold text-gray-500">
                                        {showAllHikingRecords
                                            ? '접기'
                                            : `더보기 (${filteredHikingRecords.length - HIKING_RECORDS_LIMIT}개 더)`}
                                    </Text>
                                    <Text className="text-[10px] text-gray-400">
                                        {showAllHikingRecords ? '▲' : '▼'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <View className="items-center justify-center py-10 bg-gray-50 rounded-2xl">
                            <Text className="text-gray-400 text-sm">기록된 등산 내역이 없습니다.</Text>
                        </View>
                    )}
                </View>

                <View className="h-2 bg-gray-50 my-6" />

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