import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { House, Map, CircleUserRound, MessageSquareText, UserSearch } from "lucide-react-native";
import NeogulGuide from "../../components/NeogulGuide";
import ChatBot from "../pages/chatbot/ChatBot";

// React Navigation을 사용한다고 가정 (경로 확인용)
// 실제 사용 시 navigation.navigate("경로") 형태로 사용합니다.
export default function MainLayout({ children, currentRoute, navigation }) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    // 활성화된 탭인지 확인하는 함수
    const isActive = (routeName) => currentRoute === routeName;

    return (
        <View className="flex-1 bg-gray-100 items-center">
            {/* 모바일 뷰박스 역할을 하는 메인 컨테이너 */}
            <View className="w-full max-w-[450px] flex-1 bg-white relative">

                {/* Outlet 대신 children 렌더링 (또는 Stack.Screen이 이 자리에 위치) */}
                <View className="flex-1">
                    {children}
                </View>

                {/* 홈 화면이면서 챗봇이 닫혀있을 때만 너굴 가이드 표시 */}
                {currentRoute === "Home" && !isChatOpen && (
                    <NeogulGuide onOpen={() => setIsChatOpen(true)} />
                )}

                {/* 챗봇 모달 */}
                <Modal
                    visible={isChatOpen}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsChatOpen(false)}
                >
                    <View className="flex-1 bg-black/40 justify-center items-center px-4">
                        <View className="w-full max-w-[400px] h-[80%] bg-white rounded-3xl overflow-hidden">
                            <ChatBot onClose={() => setIsChatOpen(false)} />
                        </View>
                    </View>
                </Modal>

                {/* 하단 네비게이션 바 */}
                <View
                    className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex-row justify-around items-center pb-4 z-[1000]"
                    style={{ elevation: 10 }} // 하단 바 그림자
                >
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Home")}
                        className="items-center gap-1"
                    >
                        <House size={20} color={isActive("Home") ? "#3b82f6" : "#6b7280"} />
                        <Text className={`text-[10px] font-extrabold ${isActive("Home") ? "text-blue-500" : "text-gray-500"}`}>
                            홈
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate("Map")}
                        className="items-center gap-1"
                    >
                        <Map size={24} color={isActive("Map") ? "#3b82f6" : "#6b7280"} />
                        <Text className={`text-[10px] font-extrabold ${isActive("Map") ? "text-blue-500" : "text-gray-500"}`}>
                            지도
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate("Mate")}
                        className="items-center gap-1"
                    >
                        <UserSearch size={24} color={isActive("Mate") ? "#3b82f6" : "#6b7280"} />
                        <Text className={`text-[10px] font-extrabold ${isActive("Mate") ? "text-blue-500" : "text-gray-500"}`}>
                            메이트
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate("Community")}
                        className="items-center gap-1"
                    >
                        <MessageSquareText size={24} color={isActive("Community") ? "#3b82f6" : "#6b7280"} />
                        <Text className={`text-[10px] font-extrabold ${isActive("Community") ? "text-blue-500" : "text-gray-500"}`}>
                            커뮤니티
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate("MyPage")}
                        className="items-center gap-1"
                    >
                        <CircleUserRound size={24} color={isActive("MyPage") ? "#3b82f6" : "#6b7280"} />
                        <Text className={`text-[10px] font-extrabold ${isActive("MyPage") ? "text-blue-500" : "text-gray-500"}`}>
                            마이페이지
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}