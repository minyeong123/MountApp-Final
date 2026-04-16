import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { Camera, User, CheckCircle, XCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

// 닉네임 중복 확인 모의 함수
async function checkNicknameAPI(nickname) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const takenNames = ["admin", "test", "manager"];
            resolve(!takenNames.includes(nickname.toLowerCase()));
        }, 600);
    });
}

export default function Profile() {
    const navigation = useNavigation();

    // --- 상태 관리 ---
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [nickname, setNickname] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [checking, setChecking] = useState(false);
    const [checkResult, setCheckResult] = useState(null);

    const BACKEND_URL = Platform.OS === 'android' ? "http://10.0.2.2:8080" : "http://localhost:8080";

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        // 실제로는 AsyncStorage 등에서 토큰을 가져와야 합니다.
        const token = "YOUR_JWT_TOKEN";
        try {
            const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userData = res.data;
            setUser(userData);
            setNickname(userData.nickname || "");
            if (userData.profileImage) {
                setAvatarPreview(`${BACKEND_URL}${userData.profileImage}`);
            }
        } catch (err) {
            Alert.alert("에러", "회원 정보를 불러오지 못했습니다.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleCheckNickname = async () => {
        if (!nickname.trim()) {
            Alert.alert("알림", "활동명을 입력하세요.");
            return;
        }
        setChecking(true);
        const result = await checkNicknameAPI(nickname.trim());
        setChecking(false);
        setCheckResult(result);
    };

    const handleConfirm = async () => {
        if (!nickname.trim()) {
            Alert.alert("알림", "활동명을 입력해 주세요.");
            return;
        }
        if (user && nickname !== user.nickname && checkResult !== true) {
            Alert.alert("알림", "활동명 중복 확인이 필요합니다.");
            return;
        }

        // 실제 전송 로직 (FormData 구성 등)
        Alert.alert("성공", "프로필이 수정되었습니다.");
        navigation.goBack();
    };

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#000" />
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center h-14 px-4 pt-10 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ChevronLeft size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="flex-1 text-center font-bold text-lg text-gray-900 mr-10">프로필 수정</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Image Section */}
                <View className="items-center py-8">
                    <TouchableOpacity
                        onPress={() => Alert.alert("이미지 선택", "갤러리에서 사진을 선택합니다.")}
                        className="relative"
                    >
                        <View className="w-28 h-28 rounded-full bg-gray-50 overflow-hidden border border-gray-200 items-center justify-center shadow-sm">
                            {avatarPreview ? (
                                <Image source={{ uri: avatarPreview }} className="w-full h-full" />
                            ) : (
                                <User size={48} color="#D1D5DB" />
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-gray-200 shadow-md">
                            <Camera size={20} color="#4B5563" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Nickname Section */}
                <View className="px-5 space-y-3">
                    <Text className="text-sm font-bold text-gray-700">
                        활동명 <Text className="text-orange-500">*</Text>
                    </Text>

                    <View className="flex-row gap-2">
                        <View className="flex-1 relative justify-center">
                            <TextInput
                                value={nickname}
                                onChangeText={(text) => {
                                    setNickname(text);
                                    setCheckResult(null);
                                }}
                                placeholder="활동명을 입력하세요"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 pr-10"
                            />
                            <View className="absolute right-3">
                                {checkResult === true && <CheckCircle size={20} color="#10B981" />}
                                {checkResult === false && <XCircle size={20} color="#EF4444" />}
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleCheckNickname}
                            disabled={!nickname || (user && nickname === user.nickname)}
                            className={`px-4 py-3 rounded-xl justify-center items-center min-w-[90px] ${
                                (!nickname || (user && nickname === user.nickname)) ? "bg-gray-200" : "bg-blue-600"
                            }`}
                        >
                            {checking ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text className={`font-bold ${(!nickname || (user && nickname === user.nickname)) ? "text-gray-400" : "text-white"}`}>
                                    중복확인
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {checkResult === true && <Text className="text-sm text-green-600 font-medium">사용 가능한 활동명입니다.</Text>}
                    {checkResult === false && <Text className="text-sm text-red-600 font-medium">이미 사용 중인 활동명입니다.</Text>}
                </View>

                <View className="h-3 bg-gray-50 my-8" />

                {/* Info Section */}
                <View className="px-5">
                    <View className="flex-row justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">내 정보</h3>
                        <TouchableOpacity onPress={() => navigation.navigate('ChangeInfo')} className="flex-row items-center">
                            <Text className="text-sm text-gray-400 mr-1">수정하기</Text>
                            <ChevronRight size={16} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>

                    <View className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
                        <InfoRow label="이름" value={user?.name} />
                        <InfoRow label="생년월일" value={user?.birthdate} />
                        <InfoRow label="성별" value={user?.gender === "MALE" ? "남성" : user?.gender === "FEMALE" ? "여성" : "-"} />
                        <InfoRow label="전화번호" value={user?.phone} />
                        <InfoRow label="이메일" value={user?.email} />
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* Bottom Button */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <TouchableOpacity
                    onPress={handleConfirm}
                    className="w-full py-4 bg-slate-900 rounded-xl items-center shadow-lg"
                >
                    <Text className="text-white font-bold text-base">확인</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function InfoRow({ label, value }) {
    return (
        <View className="flex-row justify-between items-center">
            <Text className="text-sm font-bold text-gray-900">{label}</Text>
            <Text className="text-sm text-gray-600">{value || "-"}</Text>
        </View>
    );
}