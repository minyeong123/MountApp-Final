import React, { useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { MessageCircle } from 'lucide-react-native';

const NeogulGuide = ({ onOpen }) => {
    const [isHovered, setIsHovered] = useState(false);

    // 1. 애니메이션 설정 (framer-motion 대체)
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const tooltipAnim = useRef(new Animated.Value(0)).current;

    // 터치(Hover 대용) 시 애니메이션
    const handlePressIn = () => {
        setIsHovered(true);
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true }),
            Animated.timing(tooltipAnim, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();
    };

    const handlePressOut = () => {
        setIsHovered(false);
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
            Animated.timing(tooltipAnim, { toValue: 0, duration: 200, useNativeDriver: true })
        ]).start();
    };

    return (
        <Animated.View
            style={{
                transform: [{ scale: scaleAnim }],
                position: 'absolute',
                bottom: 90,
                left: '50%',
                marginLeft: 120,
                zIndex: 9999
            }}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onOpen}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="items-center"
            >
                <View className="relative items-center">

                    {/* --- 말풍선 영역 (툴팁) --- */}
                    <Animated.View
                        style={{
                            opacity: tooltipAnim,
                            transform: [{ translateY: tooltipAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -8]
                                }) }],
                            position: 'absolute',
                            top: -75,
                            left: -80,
                            pointerEvents: 'none'
                        }}
                    >
                        <View className="relative items-center justify-center">
                            {/* 말풍선 아이콘 변형 (scale-x-[-1] 및 타원형 scale 적용) */}
                            <MessageCircle
                                size={110}
                                strokeWidth={0}
                                fill="#C1E8AF"
                                style={{ transform: [{ scaleX: -1.2 }, { scaleY: 0.8 }] }}
                            />

                            {/* 아이콘 내부 텍스트 */}
                            <View className="absolute top-[30%] left-[32%] -translate-x-1/2">
                                <Text className="text-[11px] font-bold text-[#2D4B22] text-center">
                                    준비됐나요?{"\n"}산으로 떠나요!
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* 너굴 가이드 이미지 (좌우 반전) */}
                    <Image
                        source={require("../../assets/images/neogulGuide.jpeg")}
                        className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover"
                        style={{ transform: [{ scaleX: -1 }] }}
                    />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default NeogulGuide;