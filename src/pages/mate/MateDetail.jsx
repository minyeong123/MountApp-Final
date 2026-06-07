import { useEffect, useState } from 'react';
import { MOUNTAIN_DATA } from '../home/mountainData';
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

// --- 개선된 이미지 처리 로직 ---
    const ImageLoader = {
        // 공통: 파일명에서 경로 추출 및 서버 주소 결합
        toFullUrl: (path, folder = 'uploads') => {
            if (!path || typeof path !== 'string') return null;
            if (path.startsWith("http")) return path;
            const filename = path.split('\\').pop().split('/').pop();
            return `${BACKEND_URL}/${folder}/${filename}`;
        },

        // 1. 프로필 이미지
        profile: (path) => {
            if (!path) return null;
            if (path.startsWith("/images/")) return `${BACKEND_URL}${path}`;
            return ImageLoader.toFullUrl(path, 'uploads');
        },

        course: (course, fallbackData) => {
            // ✅ 로컬 데이터에서 imageSource 복원
            if (course?.mountainId && course?.trailId) {
                const trails = MOUNTAIN_DATA[course.mountainId] || [];
                const found = trails.find(t => t.id === course.trailId);
                if (found?.imageSource) return found.imageSource; // require() 객체 반환
            }
            // 기존 fallback 유지
            if (course?.image?.startsWith("http")) return { uri: course.image };
            return { uri: ImageLoader.main(fallbackData) };
        },

        // 3. 메인 이미지 (가장 복잡한 로직을 독립시킴)
        main: (item) => {
            const isReal = (p) => p && typeof p === 'string' && !/(placeholder|default|null)/i.test(p);

            // 데이터에서 우선순위대로 이미지 찾기
            const rawUrl = item?.imageUrl || item?.imageUrls?.[0] || (item?.images?.[0]?.url || item?.images?.[0]);
            if (isReal(rawUrl)) return ImageLoader.toFullUrl(rawUrl, 'uploads');

            // 매칭되는 산 정보가 있으면 산 대표 이미지 반환
            const mtName = item?.mountainName || item?.course?.name?.split(' ')[0];
            const matched = mountains.find(m => m.name.includes(mtName) || mtName.includes(m.name));
            if (matched && isReal(matched.imageUrl)) return ImageLoader.toFullUrl(matched.imageUrl, 'images');

            return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop';
        }
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
                    } catch (e) { }
                }
            } catch (error) {
                Alert.alert("알림", "데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

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
            Alert.alert("오류", typeof error.response?.data === 'string' ? error.response.data : "참여 신청에 실패했습니다.");
        }
    };

    if (loading) return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="#3CD371" /></View>;
    if (!data) return <View className="flex-1 justify-center items-center bg-white"><Text>데이터를 찾을 수 없습니다.</Text></View>;

    const currentName = currentUser?.nickname || currentUser?.userid;
    const isJoined = (data.members?.list || []).some(m => m.name === currentName);
    const isFull = (data.members?.current || 0) >= (data.members?.max || 0);

    let buttonText = "참여 신청하기";
    let buttonClass = "bg-[#3CD371]";
    let isDisabled = false;
    if (isJoined) { buttonText = "이미 가입되어 있습니다"; buttonClass = "bg-gray-400"; isDisabled = true; }
    else if (isFull) { buttonText = "모집이 마감되었습니다"; buttonClass = "bg-gray-400"; isDisabled = true; }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-between items-center px-4 py-3 bg-white/95 border-b border-gray-50 z-20 mt-1">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text
                        className="font-bold text-[17px]"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {data.mountainName}
                    </Text>
                </View>
                <View className="flex-row">
                    <Heart size={22} className="mr-4" />
                </View>
            </View>

            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                <View className="relative h-72 bg-gray-100">
                    <Image source={{ uri: ImageLoader.main(data) }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute bottom-4 right-4 bg-black/40 px-2 py-1 rounded"><Text className="text-white text-[11px]">🏔️ 해발 {data.elevation || 0}m</Text></View>
                </View>

                <View className="p-5 pb-32">
                    <View className="flex-row mb-3">{(data.tags || []).map((tag, i) => (<View key={i} className={`mr-2 px-3 py-1 rounded-full ${tag.color === 'green' ? 'bg-green-50' : 'bg-orange-50'}`}><Text className={`text-[11px] font-bold ${tag.color === 'green' ? 'text-green-500' : 'text-orange-500'}`}>{tag.label}</Text></View>))}</View>
                    <Text className="text-[22px] font-extrabold text-gray-900 mb-3">{data.title}</Text>
                    <Text className="text-[14px] text-gray-600 mb-8">{data.description}</Text>

                    <View className="mb-10 space-y-3">
                        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl"><Calendar size={20} color="#3CD371" /><View className="ml-3"><Text className="text-[11px] text-gray-400">일시</Text><Text className="font-bold">{data.meeting?.date}</Text></View></View>
                        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl"><MapPin size={20} color="#3CD371" /><View className="ml-3"><Text className="text-[11px] text-gray-400">장소</Text><Text className="font-bold">{data.meeting?.location}</Text></View></View>
                    </View>

                    <View className="mb-10">
                        <Text className="font-extrabold text-[19px] mb-4">등산 코스</Text>
                        <View className="relative h-64 rounded-2xl overflow-hidden bg-gray-200">
                            <Image source={ImageLoader.course(data.course, data)} className="w-full h-full" resizeMode="cover" />
                            <View className="absolute inset-0 bg-black/40" />
                            <View className="absolute bottom-4 left-5">
                                <Text className="text-white text-[17px] font-bold">{data.course?.name || "코스 정보 없음"}</Text>
                                <Text className="text-white/90 text-[13px]">난이도: {data.course?.difficulty || "미상"}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="mb-10 border-2 border-gray-50 p-5 rounded-2xl">
                        <Text className="font-extrabold text-[17px] mb-4">상세 일정</Text>
                        {(data.schedule || []).map((step, i) => (
                            <View key={i} className="flex-row">
                                {/* 왼쪽: 시간 + 점 + 라인 */}
                                <View className="items-center w-14">
                                    <Text className="text-[11px] text-gray-400 pt-0.5">{step.time}</Text>
                                    <View className="w-2.5 h-2.5 rounded-full bg-[#3CD371] mt-1.5" />
                                    {i < (data.schedule.length - 1) && (
                                        <View className="w-0.5 bg-gray-200 flex-1 mt-0.5" />
                                    )}
                                </View>
                                {/* 오른쪽: 내용 */}
                                <View className="pl-3 pb-6 flex-1">
                                    <Text className="font-bold text-[14px]">{step.title}</Text>
                                    <Text className="text-[12px] text-gray-400 mt-0.5">{step.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View className="mb-10">
                        <Text className="font-extrabold text-[19px] mb-4">주최자 소개</Text>
                        <View className="flex-row items-start p-4 border border-gray-100 rounded-2xl bg-white">
                            <View className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
                                {ImageLoader.profile(data.host?.profileImg) ? (
                                    <Image source={{ uri: ImageLoader.profile(data.host.profileImg) }} className="w-full h-full" />
                                ) : <User size={32} color="#9CA3AF" />}
                            </View>
                            <View className="ml-4 flex-1"><Text className="font-bold text-[16px]">{data.host?.name}</Text><Text className="text-[13px] text-gray-600">{data.host?.bio}</Text></View>
                        </View>
                    </View>

                    <View className="mb-10">
                        <Text className="font-extrabold text-[19px] mb-5">참여 멤버</Text>
                        <View className="flex-row flex-wrap">
                            {(data.members?.list || []).map((member, i) => (
                                <View key={i} className="items-center mb-6 w-1/5"><View className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden">
                                    <Image source={{ uri: ImageLoader.profile(member.profileImg) }} className="w-full h-full" />
                                </View><Text className="mt-2 text-[12px]">{member.name}</Text></View>
                            ))}
                        </View>
                    </View>

                    <View className="p-6 rounded-2xl bg-orange-50 border border-orange-100">
                        <View className="flex-row items-center mb-4"><ShieldAlert size={20} color="#9A3412" /><Text className="ml-2 font-extrabold text-orange-900">주의사항</Text></View>
                        {(data.notices || []).map((n, i) => <Text key={i} className="text-[13px] text-gray-700">• {n}</Text>)}
                    </View>
                </View>
            </ScrollView>

            <View className="absolute bottom-0 w-full bg-white px-5 py-4 border-t border-gray-100 flex-row items-center justify-between">
                <View><Text className="text-[12px] text-gray-400">참여 인원</Text><Text className="text-[20px] font-black text-[#3CD371]">{data.members?.current} / {data.members?.max}명</Text></View>
                <TouchableOpacity onPress={handleJoin} disabled={isDisabled} className={`px-8 py-3.5 rounded-2xl ${buttonClass}`}><Text className="text-white font-extrabold">{buttonText}</Text></TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}