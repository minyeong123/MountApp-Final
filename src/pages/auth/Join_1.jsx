import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react-native";
import axios from "axios";

export default function Join_1() {
    const navigation = useNavigation();

    // 1. 상태 관리
    const [formData, setFormData] = useState({
        nickname: '',
        userid: '',
        password: '',
        passwordConfirm: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 중복 확인 상태
    const [nickStatus, setNickStatus] = useState({ loading: false, result: null });
    const [idStatus, setIdStatus] = useState({ loading: false, result: null });

    // 2. 입력 핸들러 (네이티브는 직접 value를 받음)
    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "nickname") setNickStatus({ loading: false, result: null });
        if (name === "userid") setIdStatus({ loading: false, result: null });
    };

    const SERVER_URL = "http://YOUR_SERVER_IP:8082"; // 실제 서버 IP로 수정 필요

    // 3. 닉네임 중복 확인
    const handleCheckNickname = async () => {
        if (!formData.nickname.trim()) return Alert.alert("알림", "활동명을 입력해주세요.");
        setNickStatus(prev => ({ ...prev, loading: true }));
        try {
            const res = await axios.get(`${SERVER_URL}/api/auth/check-nickname`, { params: { nickname: formData.nickname } });
            setNickStatus({ loading: false, result: res.data });
        } catch (e) {
            setNickStatus({ loading: false, result: false });
            Alert.alert("오류", "중복 확인 중 오류가 발생했습니다.");
        }
    };

    // 4. 아이디 중복 확인
    const handleCheckID = async () => {
        if (!formData.userid.trim()) return Alert.alert("알림", "아이디를 입력해주세요.");
        setIdStatus(prev => ({ ...prev, loading: true }));
        try {
            const res = await axios.get(`${SERVER_URL}/api/auth/check-userid`, { params: { userid: formData.userid } });
            setIdStatus({ loading: false, result: res.data });
        } catch (e) {
            setIdStatus({ loading: false, result: false });
            Alert.alert("오류", "중복 확인 중 오류가 발생했습니다.");
        }
    };

    // 5. 전체 유효성 검사
    const isFormValid =
        nickStatus.result === true &&
        idStatus.result === true &&
        formData.password.length >= 8 &&
        formData.password === formData.passwordConfirm;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

                {/* 상단 헤더 */}
                <View className="flex-row items-center px-4 py-6 border-b border-gray-50 relative">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-6 z-10">
                        <ChevronLeft size={24} color="#1f2937" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text className="w-full text-center text-2xl font-bold text-gray-800">계정 정보</Text>
                </View>

                {/* 진행 바 */}
                <View className="px-8 mt-8">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-indigo-500 font-bold text-base">Step 1/2</Text>
                        <Text className="text-gray-400 text-sm font-medium">계정 설정</Text>
                    </View>
                    <View className="flex-row gap-x-4">
                        <View className="flex-1 h-[5px] bg-indigo-500 rounded-full" />
                        <View className="flex-1 h-[5px] bg-gray-100 rounded-full" />
                    </View>
                </View>

                {/* 메인 타이틀 */}
                <View className="px-8 mt-10">
                    <Text className="text-3xl font-black text-gray-900">환영합니다! 👋</Text>
                    <Text className="text-gray-400 mt-3 text-base">서비스 이용을 위해 기본 계정 정보를 설정해주세요.</Text>
                </View>

                {/* 입력 폼 영역 */}
                <View className="px-8 mt-8 space-y-7">

                    {/* 활동명 */}
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-700 mb-2">
                            활동명(별칭) <Text className="text-red-500">*</Text>
                        </Text>
                        <View className="relative">
                            <TextInput
                                placeholder="예: 홍길동"
                                value={formData.nickname}
                                onChangeText={(val) => handleInputChange("nickname", val)}
                                className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700"
                            />
                            <TouchableOpacity
                                onPress={handleCheckNickname}
                                className="absolute right-3 top-2.5 px-4 py-2 bg-gray-200 rounded-xl"
                            >
                                {nickStatus.loading ? <ActivityIndicator size="small" color="#6366f1" /> : <Text className="text-gray-500 text-xs font-bold">중복확인</Text>}
                            </TouchableOpacity>
                        </View>
                        {nickStatus.result === true && (
                            <View className="flex-row items-center mt-2 ml-1">
                                <CheckCircle size={14} color="#16a34a" />
                                <Text className="text-xs text-green-600 ml-1">사용 가능한 활동명입니다.</Text>
                            </View>
                        )}
                        {nickStatus.result === false && (
                            <View className="flex-row items-center mt-2 ml-1">
                                <XCircle size={14} color="#ef4444" />
                                <Text className="text-xs text-red-500 ml-1">이미 사용 중인 활동명입니다.</Text>
                            </View>
                        )}
                    </View>

                    {/* 아이디 */}
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-700 mb-2">
                            아이디 <Text className="text-red-500">*</Text>
                        </Text>
                        <View className="relative">
                            <TextInput
                                placeholder="영문, 숫자 포함 6-20자"
                                value={formData.userid}
                                onChangeText={(val) => handleInputChange("userid", val)}
                                autoCapitalize="none"
                                className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700"
                            />
                            <TouchableOpacity
                                onPress={handleCheckID}
                                className="absolute right-3 top-2.5 px-4 py-2 bg-gray-200 rounded-xl"
                            >
                                {idStatus.loading ? <ActivityIndicator size="small" color="#6366f1" /> : <Text className="text-gray-500 text-xs font-bold">중복확인</Text>}
                            </TouchableOpacity>
                        </View>
                        {idStatus.result === true && (
                            <View className="flex-row items-center mt-2 ml-1">
                                <CheckCircle size={14} color="#16a34a" />
                                <Text className="text-xs text-green-600 ml-1">사용 가능한 아이디입니다.</Text>
                            </View>
                        )}
                    </View>

                    {/* 비밀번호 */}
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-700 mb-2">
                            비밀번호 <Text className="text-red-500">*</Text>
                        </Text>
                        <View className="relative justify-center">
                            <TextInput
                                placeholder="비밀번호를 입력해주세요"
                                value={formData.password}
                                onChangeText={(val) => handleInputChange("password", val)}
                                secureTextEntry={!showPassword}
                                className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-5"
                            >
                                {showPassword ? <Eye size={20} color="#9ca3af" /> : <EyeOff size={20} color="#9ca3af" />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 비밀번호 확인 */}
                    <View className="mb-10">
                        <Text className="text-sm font-bold text-gray-700 mb-2">
                            비밀번호 확인 <Text className="text-red-500">*</Text>
                        </Text>
                        <View className="relative justify-center">
                            <TextInput
                                placeholder="비밀번호를 다시 한번 입력해주세요"
                                value={formData.passwordConfirm}
                                onChangeText={(val) => handleInputChange("passwordConfirm", val)}
                                secureTextEntry={!showConfirmPassword}
                                className={`w-full h-14 px-5 bg-gray-50 border rounded-2xl ${
                                    formData.passwordConfirm && formData.password !== formData.passwordConfirm
                                        ? 'border-red-400' : 'border-gray-100'
                                }`}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-5"
                            >
                                {showConfirmPassword ? <Eye size={20} color="#9ca3af" /> : <EyeOff size={20} color="#9ca3af" />}
                            </TouchableOpacity>
                        </View>
                        {formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                            <Text className="text-xs text-red-500 mt-2 ml-1 font-medium">비밀번호가 일치하지 않습니다.</Text>
                        )}
                    </View>
                </View>

                {/* 하단 다음 버튼 */}
                <View className="px-8 py-10">
                    <TouchableOpacity
                        disabled={!isFormValid}
                        onPress={() => {
                            navigation.navigate('Join_2', {
                                userid: formData.userid,
                                password: formData.password,
                                nickname: formData.nickname
                            });
                        }}
                        className={`w-full py-5 rounded-2xl items-center ${
                            isFormValid ? "bg-indigo-600 shadow-md" : "bg-gray-100"
                        }`}
                    >
                        <Text className={`text-xl font-bold ${isFormValid ? "text-white" : "text-gray-300"}`}>다음</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}