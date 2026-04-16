import React, { useState, useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Flame, AlertTriangle } from "lucide-react-native";

// 1. 재난 타입별 스타일 (웹의 Tailwind 클래스 그대로 유지)
const getAlertStyle = (type) => {
    switch (type) {
        case "FIRE":
            return {
                bg: "bg-red-50",
                border: "border-red-200",
                text: "text-red-700",
                icon: <Flame size={20} color="#dc2626" />, // animate-pulse는 네이티브에서 별도 로직 필요하므로 기본 아이콘
                label: "산불주의",
            };
        case "LANDSLIDE":
            return {
                bg: "bg-orange-50",
                border: "border-orange-200",
                text: "text-orange-800",
                icon: <AlertTriangle size={20} color="#ea580c" />,
                label: "산사태",
            };
        default:
            return {
                bg: "bg-gray-50",
                border: "border-gray-200",
                text: "text-gray-700",
                icon: <AlertTriangle size={20} color="#4b5563" />,
                label: "알림",
            };
    }
};

export default function DisasterBanner({ alerts = [] }) {
    const [index, setIndex] = useState(0);

    // Framer Motion의 AnimatePresence 역할을 대신할 Animated 값
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!alerts || alerts.length <= 1) return;

        const interval = setInterval(() => {
            // 사라짐 (Exit 애니메이션)
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: -10, duration: 300, useNativeDriver: true }),
            ]).start(() => {
                // 인덱스 변경 및 위치 초기화
                setIndex((prev) => (prev + 1) % alerts.length);
                translateY.setValue(10); // 아래쪽에서 대기

                // 나타남 (Initial -> Animate 애니메이션)
                Animated.parallel([
                    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
                ]).start();
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [alerts.length]);

    if (!alerts || alerts.length === 0) return null;

    const currentAlert = alerts[index];
    const style = getAlertStyle(currentAlert.type);

    return (
        <View
            className={`w-full px-4 py-3 mb-2 rounded-xl border flex-row items-start shadow-sm ${style.bg} ${style.border}`}
            style={{ elevation: 1 }} // 안드로이드 그림자
        >
            {/* 아이콘 영역 */}
            <View className="mr-3 mt-0.5">
                {style.icon}
            </View>

            {/* 텍스트 컨텐츠 영역 */}
            <View className="flex-1 overflow-hidden">
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: translateY }]
                    }}
                >
                    <View className="flex-row items-center flex-wrap">
                        {/* 라벨 (Badge) */}
                        <View className={`border rounded px-1.5 py-0.5 mr-2 ${style.text} border-current`}>
                            <Text className={`font-bold text-[10px] ${style.text}`}>
                                {style.label}
                            </Text>
                        </View>

                        {/* 메시지 내용 */}
                        <Text className={`text-sm font-medium leading-5 flex-1 ${style.text}`}>
                            {currentAlert.message}
                            <Text className="text-xs opacity-60 ml-1">
                                {" "}({currentAlert.time})
                            </Text>
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}