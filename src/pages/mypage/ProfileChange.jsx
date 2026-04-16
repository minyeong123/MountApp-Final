import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { Camera, ChevronDown, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function ProfileChange() {
    const navigation = useNavigation();

    // 상태 관리
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [birth, setBirth] = useState("");
    const [gender, setGender] = useState("");
    const [phone, setPhone] = useState("");
    const [emailId, setEmailId] = useState("");
    const [emailDomain, setEmailDomain] = useState("");

    // 이미지 관련 상태
    const [previewImage, setPreviewImage] = useState(null);

    const BACKEND_URL = Platform.OS === 'android' ? "http://10.0.2.2:8080" : "http://localhost:8080";

    useEffect(() => {
        const fetchUserData = async () => {
            // 실제 토큰 관리 로직 (예: AsyncStorage) 필요
            const token = "YOUR_JWT_TOKEN";
            try {
                const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const user = res.data;
                setName(user.name || "");
                setBirth(user.birthdate || "");
                setGender(user.gender || "");
                setPhone(user.phone || "");

                if (user.email && user.email.includes("@")) {
                    const [id, domain] = user.email.split("@");
                    setEmailId(id);
                    setEmailDomain(domain);
                }

                if (user.profileImage) {
                    setPreviewImage(`${BACKEND_URL}${user.profileImage}`);
                }
            } catch (err) {
                Alert.alert("에러", "회원 정보를 불러오지 못했습니다.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleConfirm = async () => {
        // 실제 전송 시에는 FormData를 사용하여 멀티파트 요청을 보내야 합니다.
        Alert.alert("성공", "회원 정보가 수정되었습니다.");
        navigation.goBack();
    };

    const inputClass = "w-full px-4 py-4 rounded-2xl border border-gray-200 text-gray-900 bg-gray-50/50";

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#0F172A" />
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center h-14 px-4 pt-10 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ChevronLeft size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="flex-1 text-center font-bold text-lg text-gray-900 mr-10">내 정보 변경</Text>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Profile Image Section */}
                <View className="items-center py-8">
                    <TouchableOpacity
                        className="relative"
                        onPress={() => Alert.alert("알림", "이미지 선택 기능을 실행합니다.")}
                    >
                        <View className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-gray-200 items-center justify-center">
                            {previewImage ? (
                                <Image source={{ uri: previewImage }} className="w-full h-full" />
                            ) : (
                                <Text className="text-4xl">👤</Text>
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 p-2 bg-slate-900 rounded-full border-2 border-white shadow-md">
                            <Camera size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="space-y-6 pb-40">
                    {/* 이름 */}
                    <View>
                        <Text className="text-sm font-bold text-gray-800 mb-2">이름 <Text className="text-orange-500">*</Text></Text>
                        <TextInput value={name} onChangeText={setName} className={inputClass} placeholder="이름을 입력하세요" />
                    </View>

                    {/* 생년월일 */}
                    <View>
                        <Text className="text-sm font-bold text-gray-800 mb-2">생년월일</Text>
                        <TextInput
                            value={birth}
                            onChangeText={setBirth}
                            className={inputClass}
                            placeholder="YYYY-MM-DD"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* 성별 */}
                    <View>
                        <Text className="text-sm font-bold text-gray-800 mb-2">성별</Text>
                        <View className="flex-row gap-3">
                            {[{ label: "남성", value: "MALE" }, { label: "여성", value: "FEMALE" }].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => setGender(option.value)}
                                    className={`flex-1 py-4 rounded-full border items-center ${
                                        gender === option.value ? "bg-blue-50 border-blue-600" : "bg-white border-gray-200"
                                    }`}
                                >
                                    <Text className={`font-bold ${gender === option.value ? "text-blue-600" : "text-gray-400"}`}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 전화번호 */}
                    <View>
                        <Text className="text-sm font-bold text-gray-800 mb-2">전화번호</Text>
                        <View className="flex-row gap-2">
                            <View className="px-4 py-4 rounded-2xl bg-gray-100 border border-gray-200 justify-center">
                                <Text className="text-gray-500 font-bold">+82</Text>
                            </View>
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                className="flex-1 px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/50"
                                placeholder="01012345678"
                            />
                        </View>
                    </View>

                    {/* 이메일 */}
                    <View>
                        <Text className="text-sm font-bold text-gray-800 mb-2">이메일 주소</Text>
                        <View className="flex-row gap-2">
                            <TextInput
                                value={emailId}
                                onChangeText={setEmailId}
                                className="flex-1 px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/50"
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                className="w-[45%] flex-row items-center justify-between px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/50"
                                onPress={() => Alert.alert("도메인 선택", "준비 중인 기능입니다.")}
                            >
                                <Text className="text-gray-900 truncate flex-1">{emailDomain || "선택"}</Text>
                                <ChevronDown size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <TouchableOpacity
                    onPress={handleConfirm}
                    className="w-full py-4 bg-slate-900 rounded-2xl items-center shadow-lg active:opacity-80"
                >
                    <Text className="text-white font-bold text-base">확인</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}