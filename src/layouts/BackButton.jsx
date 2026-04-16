import React from "react";
import { TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

export default function BackButton() {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            // navigate(-1)과 동일한 동작: 현재 스택에서 뒤로 이동
            onPress={() => navigation.goBack()}
            // 웹의 absolute left-4 디자인 유지
            className="absolute left-4 w-10 h-10 items-center justify-center rounded-full bg-white/80 shadow-sm"
            style={{ elevation: 3, top: 10 }} // 상단 여백 및 안드로이드 그림자 추가
            activeOpacity={0.7}
        >
            <ChevronLeft color="#374151" size={24} />
        </TouchableOpacity>
    );
}