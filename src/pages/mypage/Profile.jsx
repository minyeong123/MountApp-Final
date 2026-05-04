import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Camera, User, CheckCircle, XCircle, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

// API 함수 (컴포넌트 외부 유지)
async function checkNicknameAPI(nickname, url) {
    try {
        const res = await axios.get(`${url}/api/auth/check-nickname?nickname=${nickname}`);
        return res.data.available;
    } catch (err) {
        const takenNames = ["admin", "test", "manager"];
        return !takenNames.includes(nickname.toLowerCase());
    }
}

export default function Profile() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [nickname, setNickname] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [checking, setChecking] = useState(false);
    const [checkResult, setCheckResult] = useState(null);

    const BACKEND_URL = "http://10.0.2.2:8082";

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userData = res.data;
            setUser(userData);
            setNickname(userData.nickname || "");
            if (userData.profileImage) {
                // 이미지 경로가 절대경로인지 확인 필요
                setAvatarPreview(userData.profileImage.startsWith('http')
                    ? userData.profileImage
                    : `${BACKEND_URL}${userData.profileImage}`);
            }
        } catch (err) {
            console.error("데이터 로드 에러:", err);
            Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckNickname = async () => {
        if (!nickname.trim()) return;
        setChecking(true);
        const result = await checkNicknameAPI(nickname.trim(), BACKEND_URL);
        setChecking(false);
        setCheckResult(result);
    };

    const handleConfirm = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            await axios.put(`${BACKEND_URL}/api/auth/profile`, { nickname }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert("성공", "프로필이 수정되었습니다.", [
                { text: "확인", onPress: () => router.back() }
            ]);
        } catch (err) {
            Alert.alert("실패", "수정 중 오류가 발생했습니다.");
        }
    };

    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#15803d" />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 상단 헤더 */}
            <View className="flex-row items-center h-14 px-4 border-b border-gray-100 mt-6">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="flex-1 text-center font-bold text-lg text-gray-900 mr-10">프로필 수정</Text>
            </View>

            <ScrollView className="flex-1">
                {/* 아바타 섹션 */}
                <View className="items-center py-8">
                    <View className="relative">
                        <View className="w-28 h-28 rounded-full bg-gray-50 overflow-hidden border border-gray-200 items-center justify-center shadow-sm">
                            {avatarPreview ? (
                                <Image source={{ uri: avatarPreview }} className="w-full h-full" />
                            ) : (
                                <User size={48} color="#D1D5DB" />
                            )}
                        </View>
                        <TouchableOpacity className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-gray-200 shadow-md">
                            <Camera size={20} color="#4B5563" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 닉네임 입력 섹션 */}
                <View className="px-5">
                    <Text className="text-sm font-bold text-gray-700 mb-2">활동명 <Text className="text-orange-500">*</Text></Text>
                    <View className="flex-row gap-2">
                        <View className="flex-1 relative justify-center">
                            <TextInput
                                value={nickname}
                                onChangeText={(text) => { setNickname(text); setCheckResult(null); }}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300"
                                placeholder="닉네임을 입력하세요"
                            />
                            <View className="absolute right-3">
                                {checking ? <ActivityIndicator size="small" color="#6366f1" /> : (
                                    <>
                                        {checkResult === true && <CheckCircle size={20} color="#10B981" />}
                                        {checkResult === false && <XCircle size={20} color="#EF4444" />}
                                    </>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={handleCheckNickname}
                            disabled={!nickname.trim() || checking}
                            className={`px-4 py-3 rounded-xl justify-center ${!nickname ? "bg-gray-200" : "bg-blue-600"}`}
                        >
                            <Text className="text-white font-bold">중복확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-3 bg-gray-50 my-8" />

                {/* 상세 정보 섹션 */}
                <View className="px-5">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-900">내 정보</Text>
                        <TouchableOpacity
                            onPress={() => router.push('mypage/profilechange')}
                            className="flex-row items-center"
                        >
                            <Text className="text-sm text-gray-400 mr-1">수정하기</Text>
                            <ChevronRight size={16} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>

                    <View className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <InfoRow label="이름" value={user?.name} />
                        <View className="h-[1px] bg-gray-100 my-3" />
                        <InfoRow label="생년월일" value={user?.birthdate} />
                        <View className="h-[1px] bg-gray-100 my-3" />
                        <InfoRow label="전화번호" value={user?.phone} />
                        <View className="h-[1px] bg-gray-100 my-3" />
                        <InfoRow label="이메일" value={user?.email} />
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* 하단 확인 버튼 */}
            <View className="p-4 bg-white border-t border-gray-100">
                <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={checkResult === false}
                    className={`w-full py-4 rounded-xl items-center ${checkResult === false ? "bg-gray-400" : "bg-slate-900"}`}
                >
                    <Text className="text-white font-bold text-base">확인</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// 헬퍼 컴포넌트
function InfoRow({ label, value }) {
    return (
        <View className="flex-row justify-between items-center">
            <Text className="text-sm font-bold text-gray-900">{label}</Text>
            <Text className="text-sm text-gray-600">{value || "-"}</Text>
        </View>
    );
}