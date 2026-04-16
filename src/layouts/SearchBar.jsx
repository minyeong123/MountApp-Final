import React from "react";
import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";

// 부모로부터 value와 onChangeText(입력 시 실행할 함수)를 받아옵니다.
export default function SearchBar({ value, onChangeText }) {

    // 네이티브는 form 태그가 필요 없으므로 바로 View를 사용합니다.
    return (
        <View className="relative w-full">
            {/* 텍스트 입력창 */}
            <TextInput
                className="w-full p-3 pl-11 border-2 border-gray-200 rounded-full bg-white text-gray-800"
                placeholder="어떤 산을 찾으시나요?"
                placeholderTextColor="#9ca3af" // Tailwind gray-400 색상

                // [핵심] 웹의 onChange -> 네이티브의 onChangeText
                value={value}
                onChangeText={onChangeText}

                // 검색 버튼 클릭 시 키보드 내리기 등 추가 옵션
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* 검색 아이콘 (절대 위치) */}
            <View className="absolute left-4 top-[14px]">
                <Search
                    size={20}
                    color="#9ca3af" // Tailwind gray-400 색상
                />
            </View>
        </View>
    );
}