import React from "react";
import { TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router"; // expo-router 환경이므로 router 사용 권장

export default function BackButton() {
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => router.back()}
            // absolute 제거, flex 환경에 맞게 크기 지정
            className="w-10 h-10 items-center justify-center rounded-full "
            activeOpacity={0.7}
        >
            <ChevronLeft color="#374151" size={24} />
        </TouchableOpacity>
    );
}