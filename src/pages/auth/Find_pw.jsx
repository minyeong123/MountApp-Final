import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Smartphone, Mail, KeyRound, Clock, Lock } from "lucide-react-native";
import axios from "axios";

export default function FindPw() {
    const navigation = useNavigation();
    const [method, setMethod] = useState("phone");
    const [userid, setUserid] = useState("");
    const [contact, setContact] = useState("");

    const [isSent, setIsSent] = useState(false);
    const [authCode, setAuthCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(180);

    const [isVerified, setIsVerified] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    const isFormValid = userid.trim() !== "" && contact.trim() !== "";

    // 1. 타이머 로직
    useEffect(() => {
        let timer;
        if (isSent && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isSent, timeLeft]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // 2. 인증번호 발송 (API 서버 IP 주소 확인 필요)
    const handleSendAuthCode = async () => {
        const SERVER_URL = "http://YOUR_SERVER_IP:8082";
        try {
            if (method === "email") {
                await axios.post(`${SERVER_URL}/api/auth/find-pw/send-code`, { userid, email: contact });
            } else {
                await axios.post(`${SERVER_URL}/api/sms/send`, { phone: contact });
            }
            setIsSent(true);
            setTimeLeft(180);
            Alert.alert("발송 완료", `${method === "email" ? "이메일" : "휴대폰"}로 인증번호가 발송되었습니다!`);
        } catch (error) {
            Alert.alert("오류", error.response?.data || "일치하는 회원 정보를 찾을 수 없습니다.");
        }
    };

    // 3. 인증번호 확인
    const handleVerifyCode = async () => {
        const SERVER_URL = "http://YOUR_SERVER_IP:8082";
        try {
            if (method === "email") {
                await axios.post(`${SERVER_URL}/api/auth/find-pw/verify-code`, { email: contact, code: authCode });
            } else {
                await axios.post(`${SERVER_URL}/api/sms/verify`, { phone: contact, code: authCode });
            }
            Alert.alert("인증 성공", "인증되었습니다. 새 비밀번호를 입력해주세요.");
            setIsVerified(true);
        } catch (error) {
            Alert.alert("인증 실패", error.response?.data || "인증번호가 일치하지 않습니다.");
        }
    };

    // 4. 새 비밀번호 재설정
    const handleResetPassword = async () => {
        if (newPassword.length < 4) {
            Alert.alert("주의", "비밀번호를 4자리 이상 입력해주세요.");
            return;
        }
        const SERVER_URL = "http://YOUR_SERVER_IP:8082";
        try {
            await axios.post(`${SERVER_URL}/api/auth/reset-password`, { userid, newPassword });
            Alert.alert("성공", "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요!", [
                { text: "확인", onPress: () => navigation.navigate("Login") }
            ]);
        } catch (error) {
            Alert.alert("실패", "비밀번호 변경에 실패했습니다.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/* 상단 헤더 */}
                <View className="flex-row items-center px-4 py-6 border-b border-gray-100 relative">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-4 z-10">
                        <ChevronLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="w-full text-center font-bold text-xl text-gray-900">비밀번호 찾기</Text>
                </View>

                <View className="p-8 flex-1">
                    {!isVerified ? (
                        <View>
                            <View className="mb-10">
                                <Text className="text-[26px] font-bold text-gray-900 mb-3">비밀번호 재설정</Text>
                                <Text className="text-gray-500 text-[15px] leading-6">
                                    회원정보에 등록된 정보로{"\n"}비밀번호를 재설정할 수 있습니다.
                                </Text>
                            </View>

                            <View className="mb-8">
                                <Text className="text-[15px] font-bold text-gray-900 mb-3">아이디</Text>
                                <TextInput
                                    placeholder="가입한 아이디를 입력하세요"
                                    value={userid}
                                    onChangeText={setUserid}
                                    editable={!isSent}
                                    className={`w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[15px] ${isSent ? "opacity-60" : ""}`}
                                />
                            </View>

                            <View className="mb-8">
                                <Text className="text-[15px] font-bold text-gray-900 mb-3">인증 수단 선택</Text>
                                <View className="flex-row gap-x-4">
                                    <TouchableOpacity
                                        onPress={() => { setMethod("phone"); setContact(""); setIsSent(false); }}
                                        className={`flex-1 items-center justify-center py-6 rounded-3xl border-2 gap-y-2 ${method === "phone" ? "border-indigo-500 bg-indigo-50" : "border-gray-100 bg-white"}`}
                                    >
                                        <Smartphone size={24} color={method === "phone" ? "#4f46e5" : "#9ca3af"} />
                                        <Text className={`font-bold text-sm ${method === "phone" ? "text-indigo-600" : "text-gray-400"}`}>휴대폰 인증</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => { setMethod("email"); setContact(""); setIsSent(false); }}
                                        className={`flex-1 items-center justify-center py-6 rounded-3xl border-2 gap-y-2 ${method === "email" ? "border-indigo-500 bg-indigo-50" : "border-gray-100 bg-white"}`}
                                    >
                                        <Mail size={24} color={method === "email" ? "#4f46e5" : "#9ca3af"} />
                                        <Text className={`font-bold text-sm ${method === "email" ? "text-indigo-600" : "text-gray-400"}`}>이메일 인증</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="text-[15px] font-bold text-gray-900 mb-3">
                                    {method === "phone" ? "휴대폰 번호" : "이메일 주소"}
                                </Text>
                                <View className="flex-row gap-x-2">
                                    <TextInput
                                        keyboardType={method === "phone" ? "phone-pad" : "email-address"}
                                        placeholder={method === "phone" ? "'-' 없이 숫자만 입력" : "example@mail.com"}
                                        value={contact}
                                        onChangeText={setContact}
                                        editable={!isSent}
                                        className={`flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[15px] ${isSent ? "opacity-60" : ""}`}
                                    />
                                    <TouchableOpacity
                                        onPress={handleSendAuthCode}
                                        disabled={!isFormValid}
                                        className={`px-5 py-4 rounded-2xl justify-center items-center ${isFormValid ? (isSent ? "bg-indigo-50 border border-indigo-100" : "bg-indigo-600 shadow-md") : "bg-[#C1C4F8]"}`}
                                    >
                                        <Text className={`font-bold text-sm ${isFormValid && isSent ? "text-indigo-600" : "text-white"}`}>
                                            {isSent ? "재요청" : "인증 요청"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {isSent && (
                                <View className="mt-2 mb-8">
                                    <View className="relative">
                                        <View className="absolute left-4 top-[18px] z-10"><KeyRound size={20} color="#9ca3af" /></View>
                                        <TextInput
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            placeholder="인증번호 6자리 입력"
                                            value={authCode}
                                            onChangeText={setAuthCode}
                                            className="w-full pl-12 pr-20 py-4 border border-gray-200 rounded-2xl bg-white text-[15px]"
                                        />
                                        <View className="absolute right-4 top-[18px] flex-row items-center">
                                            <Clock size={16} color={timeLeft <= 60 ? "#ef4444" : "#4f46e5"} />
                                            <Text className={`ml-1 font-bold ${timeLeft <= 60 ? "text-red-500" : "text-indigo-500"}`}>{formatTime(timeLeft)}</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleVerifyCode}
                                        disabled={authCode.length < 6 || timeLeft === 0}
                                        className={`w-full py-4 rounded-2xl mt-4 items-center ${authCode.length >= 6 && timeLeft > 0 ? "bg-indigo-600 shadow-lg" : "bg-[#C1C4F8]"}`}
                                    >
                                        <Text className="text-white font-bold text-lg">확인</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View>
                            <View className="mb-10">
                                <Text className="text-[26px] font-bold text-gray-900 mb-3">새 비밀번호 설정</Text>
                                <Text className="text-gray-500 text-[15px] leading-6">
                                    인증이 완료되었습니다.{"\n"}새롭게 사용할 비밀번호를 입력해 주세요.
                                </Text>
                            </View>
                            <View className="mb-8">
                                <Text className="text-[15px] font-bold text-gray-900 mb-3">새 비밀번호</Text>
                                <View className="relative">
                                    <View className="absolute left-4 top-[18px] z-10"><Lock size={20} color="#9ca3af" /></View>
                                    <TextInput
                                        secureTextEntry={true}
                                        placeholder="새 비밀번호를 입력해주세요"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[15px]"
                                    />
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={handleResetPassword}
                                className="w-full py-4 rounded-2xl bg-indigo-600 shadow-md items-center"
                            >
                                <Text className="text-white font-bold text-lg">비밀번호 변경 완료</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}