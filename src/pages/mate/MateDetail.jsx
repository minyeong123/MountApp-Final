import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { ChevronLeft, Heart, Share2, Calendar, MapPin, User } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function MateDetail() {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || {};

    const [data, setData] = useState(null);
    const [mountains, setMountains] = useState([]);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = Platform.OS === 'android'
        ? "http://10.0.2.2:8080"
        : "http://localhost:8080";

    const getProfileImageUrl = (path) => {
        if (!path || typeof path !== 'string') return null;
        if (path.startsWith("http")) return path;
        const filename = path.split('\\').pop().split('/').pop();
        return `${BACKEND_URL}/uploads/${filename}`;
    };

    const getMainImageUrl = (item) => {
        const isRealImage = (path) => {
            if (!path || typeof path !== 'string') return false;
            const lower = path.toLowerCase();
            return !(lower.includes('placeholder') || lower.includes('default') || lower === 'null');
        };

        let userUploaded = null;
        if (item.imageUrl) userUploaded = typeof item.imageUrl === 'string' ? item.imageUrl.split(',')[0] : item.imageUrl[0];

        if (isRealImage(userUploaded)) {
            if (userUploaded.startsWith("http")) return userUploaded;
            const filename = userUploaded.split('\\').pop().split('/').pop();
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
                console.error("데이터 통신 에러:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3CD371" />
        </View>
    );

    const isFull = (data?.members?.current || 0) >= (data?.members?.max || 0);

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 pt-12 bg-white border-b border-gray-50">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text className="font-bold text-[17px]">{data?.mountainName}</Text>
                </View>
                <View className="flex-row gap-4">
                    <Heart size={22} color="#1A1A1A" />
                    <Share2 size={22} color="#1A1A1A" />
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Image Section */}
                <View className="relative bg-gray-100">
                    <Image
                        source={{ uri: getMainImageUrl(data) }}
                        className="w-full h-72"
                        resizeMode="cover"
                    />
                    <View className="absolute bottom-4 right-4 bg-black/40 p-1 rounded">
                        <Text className="text-white text-[11px]">🏔️ 해발 {data?.elevation || 0}m</Text>
                    </View>
                </View>

                {/* Info Section */}
                <View className="p-5">
                    <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row gap-2">
                            {(data?.tags || []).map((tag, i) => (
                                <View key={i} className={`px-3 py-1 rounded-full ${tag.color === 'green' ? 'bg-green-50' : 'bg-orange-50'}`}>
                                    <Text className={`text-[11px] font-bold ${tag.color === 'green' ? 'text-green-500' : 'text-orange-500'}`}>
                                        {tag.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <Text className="text-gray-400 text-[12px]">마감 {data?.deadline}</Text>
                    </View>

                    <Text className="text-[22px] font-extrabold mb-3">{data?.title}</Text>
                    <Text className="text-[14px] text-gray-600 leading-5 mb-8">{data?.description}</Text>

                    {/* Meta Cards */}
                    <View className="space-y-3 mb-10">
                        <View className="flex-row items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                            <Calendar size={20} color="#3CD371" />
                            <View>
                                <Text className="text-[11px] text-gray-400 font-medium">일시</Text>
                                <Text className="text-[14px] font-bold">{data?.meeting?.date}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                            <MapPin size={20} color="#3CD371" />
                            <View>
                                <Text className="text-[11px] text-gray-400 font-medium">장소</Text>
                                <Text className="text-[14px] font-bold">{data?.meeting?.location}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Member List */}
                    <View className="mb-10">
                        <View className="flex-row justify-between items-center mb-5">
                            <Text className="font-extrabold text-[19px]">참여 멤버</Text>
                            <Text className="text-[13px] text-gray-500 font-bold">
                                {data?.members?.current} / {data?.members?.max}명 확정
                            </Text>
                        </View>
                        <View className="flex-row flex-wrap gap-4">
                            {(data?.members?.list || []).map((member, i) => (
                                <View key={i} className="items-center w-14">
                                    <View className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border-2 border-white">
                                        <Image
                                            source={member.profileImg ? { uri: getProfileImageUrl(member.profileImg) } : null}
                                            className="w-full h-full"
                                        />
                                        {!member.profileImg && (
                                            <View className="absolute inset-0 justify-center items-center"><User size={20} color="#9CA3AF" /></View>
                                        )}
                                    </View>
                                    <Text className="mt-1 text-[10px] text-center" numberOfLines={1}>{member.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Bottom Bar */}
            <View className="absolute bottom-0 w-full bg-white p-5 border-t border-gray-50 flex-row items-center justify-between">
                <View>
                    <Text className="text-[12px] text-gray-400 font-bold">참여 인원</Text>
                    <Text className="text-[20px] font-black text-[#3CD371]">
                        {data?.members?.current} <Text className="text-gray-300 text-[14px]">/ {data?.members?.max}명</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    className={`px-8 py-4 rounded-2xl shadow-md ${isFull ? 'bg-gray-400' : 'bg-[#3CD371]'}`}
                    disabled={isFull}
                >
                    <Text className="text-white font-extrabold">{isFull ? '모집 마감' : '참여 신청하기'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}