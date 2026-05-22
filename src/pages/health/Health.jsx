import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// 화면 전체 너비를 구해 그래프 크기를 맞춥니다.
const screenWidth = Dimensions.get('window').width;
import {
    Flame, Heart, HeartPulse, Award, Calendar,
    TrendingUp, Watch, Footprints, ShieldCheck,
    Activity, TrendingDown
} from 'lucide-react-native';

export default function HealthMetricsScreen() {
    const [period, setPeriod] = useState('MONTH'); // 'WEEK' 또는 'MONTH' 선택 상태

    // 갤럭시 워치 및 라이브 센서 데이터를 포함한 확장 더미 데이터
    const healthData = {
        monthlyCalories: "4,820",
        monthlyElevation: "2,450",
        monthlyDistance: "38.5",
        avgHeartRate: "135",
        vo2Max: "42",
        fitnessLevel: "상위 15%",

        // 스마트워치 실시간 동기화 데이터
        watchModel: "Galaxy Watch7 Ultra",
        syncTime: "방금 전 동기화됨",
        todaySteps: "8,420",
        stepGoal: "10,000",
        stressLevel: "28",
        recoveryScore: "85",
        sleepDuration: "7시간 15분",

        // [신규 추가] 라이브 헬스 센서 데이터
        oxygenSaturation: "98",      // 혈중 산소 포화도 (%)
        skeletalMuscleMass: "34.2",  // 골격근량 (kg)
        bodyFatPercentage: "16.5",   // 체지방률 (%)
        currentElevation: "325"       // 현재 고도 (m)
    };

    return (
        <View className="flex-1 bg-white">

            {/* ================= 1. 최상단 네비게이션 헤더 ================= */}
            <View className="pt-14 pb-4 px-5 border-b border-gray-50 flex-row justify-between items-center bg-white">
                <Text className="text-xl font-black text-gray-900">건강 지표</Text>
                <View className="bg-gray-100 px-2 py-1 rounded-md">
                    <Text className="text-[10px] font-bold text-gray-500">월간</Text>
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
                            <Text className="text-base font-black text-emerald-600">
                                {healthData.fitnessLevel}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 2. 스마트워치 전용 투데이 헬스 지표 그리드 */}
                <View className="px-5 mb-6">
                    <Text className="text-base font-black text-gray-900 mb-3.5">오늘의 워치 라이브 데이터</Text>

                    <View className="flex-row justify-between mb-3">
                        {/* 오늘 걸음 수 정보 */}
                        <View className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                            <View className="p-2 bg-indigo-50 rounded-xl self-start mb-3">
                                <Footprints size={18} color="#4F46E5" />
                            </View>
                            <Text className="text-[10px] text-gray-400 font-bold mb-1">오늘 걸음 수</Text>
                            <Text className="text-lg font-black text-gray-800">
                                {healthData.todaySteps} <Text className="text-xs text-gray-400 font-normal">/ {healthData.stepGoal}보</Text>
                            </Text>
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

                    <View className="flex-row justify-between">
                        {/* 실시간 혈중 산소 포화도 */}
                        <View className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <View className="p-2 bg-purple-50 rounded-xl self-start mb-3">
                                <Activity size={18} color="#8B5CF6" />
                            </View>
                            <Text className="text-[10px] text-gray-400 font-bold mb-1">혈중 산소 포화도</Text>
                            <Text className="text-lg font-black text-gray-800">
                                {healthData.oxygenSaturation} <Text className="text-xs font-bold text-purple-600">정상</Text>
                            </Text>
                            <Text className="text-[10px] text-gray-400 font-medium mt-2">수면 중 최소 95% 유지</Text>
                        </View>

                        {/* 현재 실시간 고도 */}
                        <View className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <View className="p-2 bg-sky-50 rounded-xl self-start mb-3">
                                <TrendingUp size={18} color="#0EA5E9" />
                            </View>
                            <Text className="text-[10px] text-gray-400 font-bold mb-1">현재 측정 고도</Text>
                            <Text className="text-lg font-black text-gray-800">
                                {healthData.currentElevation} <Text className="text-xs font-normal text-gray-400">m</Text>
                            </Text>
                            <Text className="text-[10px] text-gray-400 font-medium mt-2">기압 센서 실시간 연동</Text>
                        </View>
                    </View>
                </View>

                {/* 3. 상세 심폐 분석 및 체성분 그리드 */}
                <View className="px-5 mb-6">
                    <Text className="text-base font-black text-gray-900 mb-3.5">심폐 및 신체 체성분 분석</Text>

                    <View className="flex-row justify-between mb-3">
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

                    {/* 골격근량 및 체지방률 인바디 데이터 행 */}
                    <View className="flex-row justify-between">
                        {/* 골격근량 */}
                        <View className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <View className="p-2 bg-orange-50 rounded-xl self-start mb-3">
                                <TrendingUp size={18} color="#EA580C" />
                            </View>
                            <Text className="text-[10px] text-gray-400 font-bold mb-1">골격근량 (BIA)</Text>
                            <Text className="text-lg font-black text-gray-800">
                                {healthData.skeletalMuscleMass} <Text className="text-xs font-normal text-gray-400">kg</Text>
                            </Text>
                        </View>

                        {/* 체지방률 */}
                        <View className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <View className="p-2 bg-amber-50 rounded-xl self-start mb-3">
                                <TrendingDown size={18} color="#D97706" />
                            </View>
                            <Text className="text-[10px] text-gray-400 font-bold mb-1">체지방률 (BIA)</Text>
                            <Text className="text-lg font-black text-gray-800">
                                {healthData.bodyFatPercentage} <Text className="text-xs font-normal text-gray-400">%</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="px-5 mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <View>
                            <Text className="text-base font-black text-gray-900">활동량 추이 그래프</Text>
                            {/* 단위를 명시해 주어 어떤 데이터인지 바로 알 수 있게 합니다 */}
                            <Text className="text-[10px] font-bold text-gray-400 mt-0.5">주간 소모 칼로리 (단위: kcal)</Text>
                        </View>
                        <Text className="text-xs font-bold text-gray-400">5월</Text>
                    </View>

                    <View className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-4 pt-6 items-center shadow-sm overflow-hidden">
                        <LineChart
                            data={{
                                labels: ["1주차", "2주차", "3주차", "이번주"],
                                datasets: [{
                                    data: [980, 1150, 1020, 1670],
                                    color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
                                    strokeWidth: 3
                                }]
                            }}
                            withHorizontalLabels={false}
                            width={screenWidth - 72}
                            height={160}
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundColor: "#f8fafc",
                                backgroundGradientFrom: "#f8fafc",
                                backgroundGradientTo: "#f8fafc",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                                propsForDots: { r: "5", strokeWidth: "2.5", stroke: "#ffffff" },
                                propsForBackgroundLines: { strokeDasharray: "5", stroke: "rgba(226, 232, 240, 0.6)" }
                            }}
                            // 🔥 [수정] 숫자 뒤에 '개별 단위'를 붙이고, 겹치지 않게 y축 위치를 살짝 조정했습니다.
                            renderDotContent={({ x, y, index }) => (
                                <Text
                                    key={index}
                                    style={{
                                        position: "absolute",
                                        left: x - 25,
                                        top: y - 22, // 점 위에 안정적으로 안착하도록 조정
                                        width: 50,
                                        fontSize: 9, // 단위가 들어가므로 폰트를 살짝 줄여 정렬 유지
                                        fontWeight: "bold",
                                        color: "#059669",
                                        textAlign: "center"
                                    }}
                                >
                                    {`${[980, 1150, 1020, 1670][index]} kcal`}
                                </Text>
                            )}
                            bezier
                            withVerticalLines={false}
                            style={{
                                marginVertical: 4,
                                borderRadius: 24,
                                paddingLeft: 90,
                                paddingRight: 40
                            }}
                        />

                        <View className="w-full flex-row justify-center mt-3 pt-3 border-t border-gray-100">
                            <Text className="text-[11px] text-gray-400 font-medium text-center">
                                이번 주 등산 활동량이 지난주 대비 <Text className="font-bold text-emerald-600">63%</Text> 증가했습니다.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 5. 건강 가이드 AI 알림 배너 */}
                <View className="mx-5 mb-10 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex-row items-center gap-3">
                    <View className="p-2 bg-amber-100 rounded-xl self-start">
                        <Award size={20} color="#B45309" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-amber-900 mb-0.5">AI 스마트워치 종합 평가</Text>
                        <Text className="text-[11px] text-amber-700 font-medium leading-4">
                            분석 결과, 현재 고도는 {healthData.currentElevation}m이며 혈중 산소 포화도({healthData.oxygenSaturation}%) 상태가 안정적입니다. 근육량 대비 신체 회복력이 우수하므로, 안전하게 목표 고도까지 산행을 즐기셔도 좋습니다!
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}