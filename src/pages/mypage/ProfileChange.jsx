import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { Camera, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';

export default function ProfileChange() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [birth, setBirth] = useState("");
    const [gender, setGender] = useState("");
    const [phone, setPhone] = useState("");
    const [emailId, setEmailId] = useState("");
    const [emailDomain, setEmailDomain] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const BACKEND_URL = "http://10.0.2.2:8082"; // Android Emulator용

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) return;

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
                const imageUrl = user.profileImage.startsWith('http')
                    ? user.profileImage
                    : `${BACKEND_URL}${user.profileImage}`;
                setPreviewImage(imageUrl);
            }
        } catch (err) {
            console.error("데이터 로드 실패", err);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const selectedImage = result.assets[0];
            setPreviewImage(selectedImage.uri);
            setImageFile({
                uri: selectedImage.uri,
                type: 'image/jpeg',
                name: 'profile.jpg',
            });
        }
    };

    const handleConfirm = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            const fullEmail = `${emailId}@${emailDomain}`;

            const formData = new FormData();

            // 방법 1: 모든 데이터를 개별 필드로 전송 (가장 안전함)
            formData.append("name", name);
            formData.append("birthdate", birth);
            formData.append("gender", gender);
            formData.append("phone", phone);
            formData.append("email", fullEmail);

            // 이미지 파일 처리 (RN 방식)
            if (imageFile) {
                formData.append("file", {
                    uri: Platform.OS === 'android' ? imageFile.uri : imageFile.uri.replace('file://', ''),
                    name: 'profile.jpg',
                    type: 'image/jpeg',
                });
            }

            await axios.put(`${BACKEND_URL}/api/auth/me`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data', // 명시적으로 설정
                },
            });

            Alert.alert("성공", "정보가 수정되었습니다.");
            router.back();
        } catch (err) {
            // 415 에러가 계속 난다면 서버의 @RequestPart 설정을 확인해야 합니다.
            console.error("에러 발생:", err.response?.data || err.message);
            Alert.alert("에러", "서버가 요청 형식을 거절했습니다(415).");
        }
    };

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#0F172A" />
        </View>
    );

    const inputClass = "w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900";

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row items-center h-24 px-4 pt-5 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="flex-1 text-center font-bold text-lg text-gray-900 mr-10">내 정보 변경</Text>
            </View>

            <ScrollView className="flex-1 px-5">
                <View className="items-center py-8">
                    <TouchableOpacity onPress={pickImage} className="relative">
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

                <View className="space-y-6">
                    <View>
                        <Text className="text-sm font-bold text-gray-800 mb-2">이름 <Text className="text-orange-500">*</Text></Text>
                        <TextInput value={name} onChangeText={setName} className={inputClass} />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-800 mb-2">생년월일</Text>
                        <TextInput value={birth} onChangeText={setBirth} placeholder="YYYY-MM-DD" className={inputClass} />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-800 mb-2">성별</Text>
                        <View className="flex-row gap-3">
                            {[{ label: "남성", value: "MALE" }, { label: "여성", value: "FEMALE" }].map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    onPress={() => setGender(opt.value)}
                                    className={`flex-1 py-4 rounded-full border items-center ${
                                        gender === opt.value ? "bg-blue-50 border-blue-600" : "bg-white border-gray-200"
                                    }`}
                                >
                                    <Text className={gender === opt.value ? "text-blue-600 font-bold" : "text-gray-400"}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-800 mb-2">전화번호</Text>
                        <View className="flex-row gap-2">
                            <View className="px-4 py-4 rounded-2xl bg-gray-100 border border-gray-200 justify-center">
                                <Text className="text-gray-500">+82</Text>
                            </View>
                            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" className={`flex-1 ${inputClass}`} />
                        </View>
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-800 mb-2">이메일 주소</Text>
                        <View className="flex-row items-center gap-2">
                            <TextInput value={emailId} onChangeText={setEmailId} className="flex-1 px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50" placeholder="아이디" />
                            <Text className="text-gray-400">@</Text>
                            <TextInput value={emailDomain} onChangeText={setEmailDomain} className="flex-1 px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50" placeholder="도메인" />
                        </View>
                    </View>
                </View>
                <View className="h-40" />
            </ScrollView>

            <View className="p-4 bg-white border-t border-gray-100">
                <TouchableOpacity onPress={handleConfirm} className="w-full py-4 bg-slate-900 rounded-2xl items-center shadow-lg">
                    <Text className="text-white font-bold text-base">확인</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}