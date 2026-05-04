import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Dimensions
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
    CircleCheck
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function MateDetail({ id }) {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [mountains, setMountains] = useState([]);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = Platform.OS === 'android' ? "http://10.0.2.2:8082" : "http://localhost:8082";

    const getProfileImageUrl = (path) => {
        if (!path || typeof path !== 'string') return null;
        if (path.startsWith("http")) return path;
        const filename = path.split('\\').pop().split('/').pop();
        return `${BACKEND_URL}/uploads/${filename}`;
    };

    const getMainImageUrl = (item) => {
        if (!item) return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop';
        let userUploaded = item.imageUrl || (item.imageUrls && item.imageUrls[0]);
        if (userUploaded) {
            if (typeof userUploaded === 'string' && userUploaded.startsWith("http")) return userUploaded;
            const filename = String(userUploaded).split('\\').pop().split('/').pop();
            return `${BACKEND_URL}/uploads/${filename}`;
        }
        return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detailRes, mtRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/api/mates/${id}`),
                    fetch(`${BACKEND_URL}/api/mountains`)
                ]);
                if (detailRes.ok) setData(await detailRes.json());
                if (mtRes.ok) setMountains(await mtRes.json());
            } catch (error) {
                console.error("데이터 로딩 에러:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#3CD371" />
        </View>
    );

    const isFull = (data?.members?.current || 0) >= (data?.members?.max || 0);

    return (
        <View className="flex-1 bg-white">
            {/* Navigation Bar */}
            <View className="flex-row justify-between items-center px-4 pt-6 pb-4 border-b border-gray-100 bg-white">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text className="font-bold text-[17px] text-gray-900">{data?.mountainName}</Text>
                </View>
                <View className="flex-row items-center space-x-4">
                    <Heart size={22} color="#4B5563" />
                    <Share2 size={22} color="#4B5563" className="ml-4" />
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View className="relative h-72 bg-gray-100">
                    <Image
                        source={{ uri: getMainImageUrl(data) }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <View className="absolute bottom-4 right-4 bg-black/40 px-2 py-1 rounded">
                        <Text className="text-white text-[11px]">🏔️ 해발 {data?.elevation || 0}m</Text>
                    </View>
                </View>

                <View className="p-5">
                    {/* Tags & Deadline */}
                    <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row">
                            {(data?.tags || []).map((tag, i) => (
                                <View key={i} className={`mr-2 px-3 py-1 rounded-full ${tag.color === 'green' ? 'bg-green-50' : 'bg-orange-50'}`}>
                                    <Text className={`text-[11px] font-bold ${tag.color === 'green' ? 'text-green-500' : 'text-orange-500'}`}>
                                        {tag.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <Text className="text-gray-400 text-[12px]">마감 {data?.deadline}</Text>
                    </View>

                    <Text className="text-[22px] font-extrabold text-gray-900 mb-3">{data?.title}</Text>
                    <Text className="text-[14px] text-gray-600 leading-6 mb-8">{data?.description}</Text>

                    {/* Meeting Info Cards */}
                    <View className="mb-10 space-y-3">
                        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-3">
                            <Calendar size={20} color="#3CD371" className="mr-4" />
                            <View className="ml-3">
                                <Text className="text-[11px] text-gray-400 font-medium">일시</Text>
                                <Text className="text-[14px] font-bold text-gray-800">{data?.meeting?.date}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
                            <MapPin size={20} color="#3CD371" className="mr-4" />
                            <View className="ml-3">
                                <Text className="text-[11px] text-gray-400 font-medium">장소</Text>
                                <Text className="text-[14px] font-bold text-gray-800">{data?.meeting?.location}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Mountain Course */}
                    <View className="mb-10">
                        <View className="flex-row justify-between items-end mb-4">
                            <Text className="font-extrabold text-[19px]">등산 코스</Text>
                            <Text className="text-[13px] text-gray-500 font-medium">왕복 약 {data?.course?.duration}</Text>
                        </View>
                        <View className="relative h-48 rounded-2xl overflow-hidden bg-gray-200">
                            <Image source={{ uri: getMainImageUrl(data) }} className="w-full h-full" />
                            <View className="absolute inset-0 bg-black/30" />
                            <View className="absolute bottom-4 left-5">
                                <Text className="text-white text-[17px] font-bold mb-1">{data?.course?.name || "기본 코스"}</Text>
                                <Text className="text-white/90 text-[13px]">난이도: {data?.course?.difficulty} • {data?.course?.distance}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Host Section */}
                    <View className="mb-10">
                        <Text className="font-extrabold text-[19px] mb-4">주최자 소개</Text>
                        <View className="flex-row p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                            <View className="relative">
                                <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
                                    {data?.host?.profileImg ? (
                                        <Image source={{ uri: getProfileImageUrl(data.host.profileImg) }} className="w-full h-full" />
                                    ) : (
                                        <User size={24} color="#9CA3AF" />
                                    )}
                                </View>
                                <View className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                                    <CircleCheck size={14} color="#3CD371" />
                                </View>
                            </View>
                            <View className="ml-4 flex-1">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="font-bold text-[16px]">{data?.host?.name}</Text>
                                    <View className="flex-row items-center">
                                        <Star size={14} color="#FBBF24" fill="#FBBF24" />
                                        <Text className="ml-1 font-bold text-[13px]">{data?.host?.rating || "5.0"}</Text>
                                    </View>
                                </View>
                                <Text className="text-[12px] text-gray-500 mb-2">등산 경력 {data?.host?.experience}</Text>
                                <Text className="text-[13px] text-gray-600" numberOfLines={2}>{data?.host?.bio}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Members Grid */}
                    <View className="mb-10">
                        <View className="flex-row justify-between items-center mb-5">
                            <Text className="font-extrabold text-[19px]">참여 멤버</Text>
                            <Text className="text-[13px] font-bold text-gray-500">{data?.members?.current} / {data?.members?.max}명 확정</Text>
                        </View>
                        <View className="flex-row flex-wrap">
                            {(data?.members?.list || []).map((member, i) => (
                                <View key={i} className="items-center mb-4" style={{ width: (width - 40) / 5 }}>
                                    <View className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden">
                                        {member.profileImg ? (
                                            <Image source={{ uri: getProfileImageUrl(member.profileImg) }} className="w-full h-full" />
                                        ) : (
                                            <View className="flex-1 items-center justify-center"><User size={20} color="#9CA3AF" /></View>
                                        )}
                                    </View>
                                    <Text className="mt-1 text-[10px] text-gray-700 font-medium" numberOfLines={1}>{member.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Notices */}
                    <View className="p-6 rounded-2xl bg-orange-50 border border-orange-100 mb-24">
                        <View className="flex-row items-center mb-4">
                            <ShieldAlert size={18} color="#9A3412" />
                            <Text className="ml-2 font-extrabold text-[16px] text-orange-900">주의사항</Text>
                        </View>
                        {(data?.notices || []).map((n, i) => (
                            <Text key={i} className="text-[13px] text-gray-700 mb-1 leading-5">• {n}</Text>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View className="absolute bottom-0 w-full bg-white px-5 py-6 border-t border-gray-100 flex-row items-center justify-between shadow-lg">
                <View>
                    <Text className="text-[12px] text-gray-400 font-bold">참여 인원</Text>
                    <Text className="text-[22px] font-black text-[#3CD371]">
                        {data?.members?.current} <Text className="text-gray-300 font-bold text-[15px]">/ {data?.members?.max}명</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    className={`px-10 py-4 rounded-2xl ${isFull ? 'bg-gray-300' : 'bg-[#3CD371]'}`}
                    disabled={isFull}
                >
                    <Text className="text-white font-black text-[16px]">
                        {isFull ? '모집 마감' : '참여 신청하기'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}