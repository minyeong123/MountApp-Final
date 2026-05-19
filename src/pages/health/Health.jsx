import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
// React Native 환경용 패키지에서 아이콘을 임포트합니다.
import {
    Flame, Heart, HeartPulse, Award, Calendar,
    TrendingUp, Watch, Footprints, ShieldCheck
} from 'lucide-react-native';

export default function HealthMetricsScreen() {
    const [period, setPeriod] = useState('MONTH'); // 'WEEK' 또는 'MONTH' 선택 상태

    // 대시보드용 건강 통계 더미 데이터
    const healthData = {
        monthlyCalories: "4,820",
        monthlyElevation: "2,450",
        monthlyDistance: "38.5",
        avgHeartRate: "135",
        vo2Max: "42",
        fitnessLevel: "상위 15%",

        // 스마트워치 실시간 동기화 데이터
        watchModel: "Apple Watch Series 10",
        syncTime: "방금 전 동기화됨",
        todaySteps: "8,420",
        stepGoal: "10,000",
        stressLevel: "28",
        recoveryScore: "85",
        sleepDuration: "7시간 15분"
    };

    return (
        <View className="flex-1 bg-white">

            {/* ================= 1. 최상단 네비게이션 헤더 ================= */}
            <View className="pt-14 pb-3 px-5 border-b border-gray-50 flex-row justify-between items-center bg-white">
                <Text className="text-xl font-black text-gray-900">건강 지표</Text>

                {/* 주간/월간 필터 탭 */}
                <View className="flex-row bg-gray-100 p-1 rounded-xl">
                    <TouchableOpacity
                        onPress={() => setPeriod('WEEK')}
                        className={`px-3 py-1.5 rounded-lg ${period === 'WEEK' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`text-xs font-bold ${period === 'WEEK' ? 'text-gray-900' : 'text-gray-400'}`}>주간</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setPeriod('MONTH')}
                        className={`px-3 py-1.5 rounded-lg ${period === 'MONTH' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`text-xs font-bold ${period === 'MONTH' ? 'text-gray-900' : 'text-gray-400'}`}>월간</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ================= 2. 스크롤 가능한 콘텐츠 본문 ================= */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* 스마트워치 연결 실시간 상태 배너 */}
                <View className="mx-5 mt-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5">
                        <View className="p-1.5 bg-blue-50 rounded-xl">
                            <Watch size={18} color="#2563EB" />
                        </View>
                        <View>
                            <Text className="text-xs font-bold text-gray-800">{healthData.watchModel}</Text>
                            <Text className="text-[10px] text-gray-400 font-medium">{healthData.syncTime}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <Text className="text-[9px] font-bold text-emerald-700">연동됨</Text>
                    </View>
                </View>

                {/* 1. 상단 종합 요약 카드 */}
                <View className="p-5 bg-emerald-600/5 mx-5 mt-4 mb-6 rounded-3xl border border-emerald-600/10">
                    <View className="flex-row items-center gap-1.5 mb-3">
                        <Calendar size={14} color="#059669" />
                        <Text className="text-xs font-bold text-emerald-700">이번 달 나의 등산 성적표</Text>
                    </View>

                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-xs font-bold text-gray-400 mb-0.5">누적 소모 칼로리</Text>
                            <Text className="text-2xl font-black text-gray-900">
                                {healthData.monthlyCalories} <Text className="text-sm font-bold text-gray-500">kcal</Text>
                            </Text>
                        </View>
                        <View className="p-3 bg-orange-500 rounded-2xl shadow-sm">
                            <Flame size={24} color="#ffffff" />
                        </View>
                    </View>

                    <View className="h-[1px] bg-gray-200/60 my-2" />

                    <View className="flex-row justify-between pt-2">
                        <View>
                            <Text className="text-[11px] font-bold text-gray-400 mb-0.5">누적 정복 고도</Text>
                            <Text className="text-base font-black text-gray-800">{healthData.monthlyElevation}m</Text>
                        </View>
                        <View>
                            <Text className="text-[11px] font-bold text-gray-400 mb-0.5">총 행군 거리</Text>
                            <Text className="text-base font-black text-gray-800">{healthData.monthlyDistance}km</Text>
                        </View>
                        <View>
                            <Text className="text-[11px] font-bold text-gray-400 mb-0.5">체력 등급</Text>
                            <Text className="text-base font-black text-emerald-600">{healthData.fitnessLevel}</Text>
                        </View>
                    </View>
                </View>

                {/* [신규 세션] 스마트워치 전용 투데이 헬스 지표 그리드 */}
                <View className="px-5 mb-6">
                    <Text className="text-base font-black text-gray-900 mb-3.5">오늘의 워치 라이브 데이터</Text>

                    <View className="flex-row justify-between">
                        {/* 오늘 걸음 수 정보 */}
                        <View className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                            <View className="p-2 bg-indigo-50 rounded-xl self-start mb-3">
                                <Footprints size={18} color="#4F46E5" />
                            </View>
                            <Text className="text-[10px] text-gray-400 font-bold mb-1">오늘 걸음 수</Text>
                            <Text className="text-lg font-black text-gray-800">
                                {healthData.todaySteps} <Text className="text-xs text-gray-400 font-normal">/ {healthData.stepGoal}보</Text>
                            </Text>
                            {/* 가상 진행률 바 */}
                            <View className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <View className="bg-indigo-600 h-full rounded-full" style={{ width: '84%' }} />
                            </View>
                        </View>

                        {/* 회복력 상태 점수 */}
                        <View className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm justify-between">
                            <View>
                                <View className="p-2 bg-teal-50 rounded-xl self-start mb-3">
                                    <ShieldCheck size={18} color="#0D9488" />
                                </View>
                                <Text className="text-[10px] text-gray-400 font-bold mb-1">나의 신체 회복력</Text>
                                <Text className="text-lg font-black text-gray-800">
                                    {healthData.recoveryScore} <Text className="text-xs text-teal-600 font-bold">좋음</Text>
                                </Text>
                            </View>
                            <Text className="text-[10px] text-gray-400 font-medium mt-3">다음 산행 준비 완료!</Text>
                        </View>
                    </View>
                </View>

                {/* 2. 활동량 추이 그래프 공간 */}
                <View className="px-5 mb-6">
                    <Text className="text-base font-black text-gray-900 mb-3">활동량 추이 그래프</Text>
                    <View className="w-full h-44 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center p-4">
                        <TrendingUp size={28} color="#D1D5DB" />
                        <Text className="text-xs font-bold text-gray-400 mt-2">최근 4주간 칼로리 소모 그래프 위치</Text>
                        <Text className="text-[10px] text-gray-300 mt-1 text-center">스마트워치 데이터와 매칭되어 실시간 렌더링됩니다.</Text>
                    </View>
                </View>

                {/* 3. 상세 신체 건강 분석 그리드 */}
                <View className="px-5 mb-8">
                    <Text className="text-base font-black text-gray-900 mb-3.5">심폐 및 신체 분석</Text>

                    <View className="flex-row justify-between">
                        {/* 평균 운동 심박수 */}
                        <View className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <View className="p-2 bg-red-50 rounded-xl self-start mb-3">
                                <Heart size={18} color="#DC2626" />
                            </View>
                            <Text className="text-[10px] text-gray-400 font-bold mb-1">평균 운동 심박수</Text>
                            <Text className="text-lg font-black text-gray-800">
                                {healthData.avgHeartRate} <Text className="text-xs font-normal text-gray-400">bpm</Text>
                            </Text>
                        </View>

                        {/* 심폐 능력 VO2 Max */}
                        <View className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <View className="p-2 bg-blue-50 rounded-xl self-start mb-3">
                                <HeartPulse size={18} color="#2563EB" />
                            </View>
                            <Text className="text-[10px] text-gray-400 font-bold mb-1">심폐 능력 (VO2 Max)</Text>
                            <Text className="text-lg font-black text-gray-800">
                                {healthData.vo2Max} <Text className="text-xs font-normal text-gray-400">점</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 4. 건강 가이드 AI 알림 배너 */}
                <View className="mx-5 mb-10 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex-row items-center gap-3">
                    <View className="p-2 bg-amber-100 rounded-xl self-start">
                        <Award size={20} color="#B45309" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-amber-900 mb-0.5">AI 스마트워치 종합 평가</Text>
                        <Text className="text-[11px] text-amber-700 font-medium leading-4">
                            워치 데이터 분석 결과, 신체 회복력({healthData.recoveryScore}점)이 매우 우수합니다. 오늘 등산 시 평소보다 약간 더 속도를 높여도 무리가 없습니다!
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}