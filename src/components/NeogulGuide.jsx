import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";

const NeogulGuide = ({ onOpen }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 1.05,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={{
                position: "absolute",
                bottom: 100,
                right: 20,
                transform: [{ scale: scaleAnim }],
                zIndex: 9999,
            }}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onOpen}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <View style={{ alignItems: "center" }}>

                    {/* 말풍선 */}
                    <View
                        style={{
                            position: "absolute",
                            bottom: 65,
                            right: 45,
                            backgroundColor: "#E8F8E8",
                            width: 100,
                            minHeight: 55,
                            justifyContent: "center",
                            alignItems: "center",
                            paddingHorizontal: 14,
                            borderRadius: 30,

                            // 그림자 설정
                            shadowColor: "#000",
                            shadowOpacity: 0.12,
                            shadowRadius: 4,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 4,

                            // 꼬리가 잘리지 않도록 설정
                            overflow: "visible",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: "700",
                                color: "#2E7D32",
                                textAlign: "center",
                                lineHeight: 18,
                                zIndex: 2,
                            }}
                        >
                            궁금한게{"\n"}있으신가요?!
                        </Text>

                        {/* 말풍선 꼬리: 위치를 곡선 안쪽으로 당겨서 깔끔하게 수정 */}
                        <View
                            style={{
                                position: "absolute",
                                bottom: -12,        // 꼬리가 아래로 뻗어나오는 길이
                                right: 25,          // ⭐️ 곡선이 끝나는 바닥 평면 쪽으로 이동 (핵심)
                                width: 0,
                                height: 0,
                                backgroundColor: "transparent",
                                borderStyle: "solid",
                                borderTopWidth: 15,    // 꼬리의 높이
                                borderLeftWidth: 15,   // 꼬리가 왼쪽으로 뻗는 너비
                                borderBottomWidth: 0,
                                borderRightWidth: 0,
                                borderTopColor: "#E8F8E8", // 말풍선 배경색
                                borderLeftColor: "transparent",
                                borderBottomColor: "transparent",
                                borderRightColor: "transparent",
                                zIndex: -1,         // 둥근 모서리 뒤로 숨겨서 이음새 제거
                            }}
                        />
                    </View>

                    {/* 너굴 이미지 */}
                    <Image
                        source={require("../../assets/images/neogulGuide.jpeg")}
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            borderWidth: 3,
                            borderColor: "#fff",
                            transform: [{ scaleX: -1 }],
                        }}
                    />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default NeogulGuide;