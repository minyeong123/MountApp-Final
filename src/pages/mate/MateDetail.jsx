import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Dimensions,
    Alert,
    SafeAreaView
} from 'react-native';
import {
    ChevronLeft,
    Heart,
    Share2,
    Calendar,
    MapPin,
    Users,
    ShieldAlert,
    Star,
    User,
    CheckCircle2
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function MateDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [data, setData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [mountains, setMountains] = useState([]);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = Platform.OS === 'android' ? "http://10.0.2.2:8082" : "http://localhost:8082";

    // 1. 프로필 이미지 안전 처리
    const getProfileImageUrl = (path) => {
        if (!path || typeof path !== 'string') return null;
        if (path.startsWith("http")) return path;
        if (path.startsWith("/images/")) return `${BACKEND_URL}${path}`;
        const filename = path.split('\\').pop().split('/').pop();
        return `${BACKEND_URL}/uploads/${filename}`;
    };

    // 2. 산 코스 메인 이미지 3단계 처리 로직
    const getMainImageUrl = (item) => {
        const isRealImage = (path) => {
            if (!path || typeof path !== 'string') return false;
            const lower = path.toLowerCase();
            return !(lower.includes('placeholder') || lower.includes('default') || lower === 'null');
        };

        // 1순위: 유저 업로드
        let userUploaded = null;
        if (item?.imageUrl) userUploaded = typeof item.imageUrl === 'string' ? item.imageUrl.split(',')[0] : item.imageUrl[0];
        else if (item?.imageUrls && item.imageUrls.length > 0) userUploaded = item.imageUrls[0];
        else if (item?.images && item.images.length > 0) userUploaded = typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url;

        if (isRealImage(userUploaded)) {
            if (userUploaded.startsWith("http") && !userUploaded.includes("8082")) return userUploaded;
            const filename = userUploaded.split('\\').pop().split('/').pop();
            return `${BACKEND_URL}/uploads/${filename}`;
        }

        // 2순위: DB 산 목록 매칭
        const mtName = item?.mountainName || (item?.course?.name ? item.course.name.split(' ')[0] : "");

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

    // 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("jwtToken");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const [detailRes, mtRes] = await Promise.all([
                    axios.get(`${BACKEND_URL}/api/mates/${id}`, { headers }),
                    axios.get(`${BACKEND_URL}/api/mountains`, { headers })
                ]);

                setData(detailRes.data);
                setMountains(mtRes.data);

                if (token) {
                    try {
                        const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, { headers });
                        setCurrentUser(userRes.data);
                    } catch (e) { /* ignore */ }
                }
            } catch (error) {
                console.error("데이터 통신 에러:", error);
                Alert.alert("알림", "데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    // 참여 신청 로직
    const handleJoin = async () => {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token || !currentUser) {
            Alert.alert("알림", "로그인이 필요한 서비스입니다.");
            return;
        }

        try {
            const response = await axios.post(`${BACKEND_URL}/api/mates/${id}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
            Alert.alert("성공", "참여가 완료되었습니다!");
        } catch (error) {
            const errorMsg = error.response?.data || "참여 신청에 실패했습니다.";
            Alert.alert("오류", typeof errorMsg === 'string' ? errorMsg : "오류가 발생했습니다.");
        }
    };

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#3CD371" />
            <Text className="mt-4 text-gray-500 font-bold">데이터를 불러오는 중입니다...</Text>
        </View>
    );

    if (!data) return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-gray-500 font-bold">데이터를 찾을 수 없습니다.</Text>
        </View>
    );

    // 참여 버튼 상태 계산
    const currentName = currentUser?.nickname || currentUser?.userid;
    const isJoined = (data.members?.list || []).some(m => m.name === currentName);
    const isFull = (data.members?.current || 0) >= (data.members?.max || 0);

    let buttonText = "참여 신청하기";
    let buttonClass = "bg-[#3CD371]";
    let isDisabled = false;

    if (isJoined) {
        buttonText = "이미 가입되어 있습니다";
        buttonClass = "bg-gray-400";
        isDisabled = true;
    } else if (isFull) {
        buttonText = "모집이 마감되었습니다";
        buttonClass = "bg-gray-400";
        isDisabled = true;
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Navigation Bar */}
            <View className="flex-row justify-between items-center px-4 py-3 bg-white/95 border-b border-gray-50 z-20">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
                        <ChevronLeft size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text className="font-bold text-[17px] text-gray-900">{data.mountainName}</Text>
                </View>
                <View className="flex-row items-center space-x-4">
                    <Heart size={22} color="#4B5563" />
                    <Share2 size={22} color="#4B5563" className="ml-4" />
                </View>
            </View>

            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View className="relative h-72 bg-gray-100">
                    <Image
                        source={{ uri: getMainImageUrl(data) }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <View className="absolute bottom-4 right-4 bg-black/40 px-2 py-1 rounded">
                        <Text className="text-white text-[11px]">🏔️ 해발 {data.elevation || 0}m</Text>
                    </View>
                </View>

                <View className="p-5 pb-32">
                    {/* Tags & Deadline */}
                    <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row">
                            {(data.tags || []).map((tag, i) => (
                                <View key={i} className={`mr-2 px-3 py-1 rounded-full ${tag.color === 'green' ? 'bg-green-50' : 'bg-orange-50'}`}>
                                    <Text className={`text-[11px] font-bold ${tag.color === 'green' ? 'text-green-500' : 'text-orange-500'}`}>
                                        {tag.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <Text className="text-gray-400 text-[12px]">마감 {data.deadline}</Text>
                    </View>

                    <Text className="text-[22px] font-extrabold text-gray-900 mb-3">{data.title}</Text>
                    <Text className="text-[14px] text-gray-600 leading-6 mb-8">{data.description}</Text>

                    {/* Meeting Info Cards */}
                    <View className="mb-10 space-y-3">
                        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-3">
                            <Calendar size={20} color="#3CD371" className="mr-4" />
                            <View className="ml-3">
                                <Text className="text-[11px] text-gray-400 font-medium">일시</Text>
                                <Text className="text-[14px] font-bold text-gray-800">{data.meeting?.date}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
                            <MapPin size={20} color="#3CD371" className="mr-4" />
                            <View className="ml-3">
                                <Text className="text-[11px] text-gray-400 font-medium">장소</Text>
                                <Text className="text-[14px] font-bold text-gray-800">{data.meeting?.location}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Mountain Course */}
                    <View className="mb-10">
                        <View className="flex-row justify-between items-end mb-4">
                            <Text className="font-extrabold text-[19px]">등산 코스</Text>
                            <Text className="text-[13px] text-gray-500 font-medium">왕복 약 {data.course?.duration}</Text>
                        </View>
                        <View className="relative h-64 rounded-2xl overflow-hidden bg-gray-200">
                            <Image source={{ uri: getMainImageUrl(data) }} className="w-full h-full" />
                            <View className="absolute inset-0 bg-black/40" />
                            <View className="absolute bottom-4 left-5">
                                <Text className="text-white text-[17px] font-bold mb-1">{data.course?.name || "기본 코스"}</Text>
                                <View className="flex-row items-center text-white/90">
                                    <Text className="text-white/90 text-[13px]">난이도: {data.course?.difficulty}</Text>
                                    <View className="w-1 h-1 bg-white/50 rounded-full mx-2" />
                                    <Text className="text-white/90 text-[13px]">{data.course?.distance}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Schedule Timeline */}
                    <View className="mb-10 border-2 border-gray-50 p-5 rounded-2xl">
                        <Text className="font-extrabold text-[17px] mb-4">상세 일정</Text>
                        <View className="relative">
                            {/* 수직선 */}
                            <View className="absolute left-[45px] top-2 bottom-2 w-[1px] bg-gray-200" />
                            {(data.schedule || []).map((step, i) => (
                                <View key={i} className="flex-row mb-6 relative">
                                    <Text className="text-[#3CD371] font-bold text-[13px] w-10 text-right">{step.time}</Text>
                                    <View className="flex-1 flex-col gap-1 pl-6">
                                        {/* 점 */}
                                        <View className="absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-[#3CD371] border-2 border-white shadow-sm" />
                                        <Text className="font-bold text-[14px] text-gray-900">{step.title}</Text>
                                        <Text className="text-[12px] text-gray-400">{step.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Host Section */}
                    <View className="mb-10">
                        <Text className="font-extrabold text-[19px] mb-4">주최자 소개</Text>
                        <View className="flex-row items-start p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                            <View className="relative flex-shrink-0">
                                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center overflow-hidden border border-gray-200">
                                    {getProfileImageUrl(data.host?.profileImg) ? (
                                        <Image source={{ uri: getProfileImageUrl(data.host.profileImg) }} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} color="#9CA3AF" />
                                    )}
                                </View>
                                <View className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                                    <CheckCircle2 size={16} color="#3CD371" fill="#3CD371" stroke="white" />
                                </View>
                            </View>
                            <View className="ml-4 flex-1">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="font-bold text-[16px]">{data.host?.name || "익명"}</Text>
                                    <View className="flex-row items-center">
                                        <Star size={14} color="#FBBF24" fill="#FBBF24" />
                                        <Text className="ml-1 font-bold text-[13px] text-gray-700">{data.host?.rating || "5.0"}</Text>
                                    </View>
                                </View>
                                <Text className="text-[12px] text-gray-500 mb-2">
                                    등산 경력 {data.host?.experience} • 인증 {data.host?.authCount}회
                                </Text>
                                <Text className="text-[13px] text-gray-600 leading-5">
                                    {data.host?.bio}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Members Grid */}
                    <View className="mb-10">
                        <View className="flex-row justify-between items-center mb-5">
                            <Text className="font-extrabold text-[19px]">참여 멤버</Text>
                            <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-md">
                                <Users size={14} color="#9CA3AF" />
                                <Text className="text-[13px] font-bold ml-1 text-gray-800">{data.members?.current}</Text>
                                <Text className="text-[13px] font-bold text-gray-300 mx-1">/</Text>
                                <Text className="text-[13px] font-bold text-gray-500">{data.members?.max}명 확정</Text>
                            </View>
                        </View>

                        <View className="flex-row flex-wrap">
                            {/* 확정 멤버 */}
                            {(data.members?.list || []).map((member, i) => (
                                <View key={i} className="items-center mb-6 w-1/5">
                                    <View className="w-14 h-14 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden items-center justify-center">
                                        {getProfileImageUrl(member.profileImg) ? (
                                            <Image source={{ uri: getProfileImageUrl(member.profileImg) }} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={24} color="#9CA3AF" />
                                        )}
                                    </View>
                                    <Text className="mt-2 text-[12px] text-gray-700 font-medium" numberOfLines={1}>{member.name || "익명"}</Text>
                                </View>
                            ))}

                            {/* 빈 자리 (대기중) */}
                            {Array.from({ length: Math.max(0, (data.members?.max || 0) - (data.members?.current || 0)) }).map((_, i) => (
                                <View key={`empty-${i}`} className="items-center mb-6 w-1/5">
                                    <View className="w-14 h-14 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                                        <Users size={20} color="#e5e7eb" />
                                    </View>
                                    <Text className="mt-2 text-[11px] text-gray-300 font-medium">대기중</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Notices */}
                    <View className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100">
                        <View className="flex-row items-center mb-4">
                            <ShieldAlert size={20} color="#9A3412" />
                            <Text className="ml-2 font-extrabold text-[16px] text-orange-900">주의사항</Text>
                        </View>
                        {(data.notices || []).map((n, i) => (
                            <View key={i} className="flex-row mb-1.5 pr-2">
                                <Text className="text-[13px] text-gray-700 mr-2">•</Text>
                                <Text className="text-[13px] text-gray-700 leading-5">{n}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View className="absolute bottom-0 w-full bg-white px-5 py-4 border-t border-gray-100 flex-row items-center justify-between shadow-lg">
                <View>
                    <Text className="text-[12px] text-gray-400 font-bold mb-1">참여 인원</Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-[20px] font-black text-[#3CD371]">{data.members?.current}</Text>
                        <Text className="text-[14px] font-bold text-gray-300 ml-1">/ {data.members?.max}명</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleJoin}
                    className={`px-8 py-3.5 rounded-2xl ${buttonClass}`}
                    disabled={isDisabled}
                >
                    <Text className="text-white font-extrabold text-[15px]">{buttonText}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}