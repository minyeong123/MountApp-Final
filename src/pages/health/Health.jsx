import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Path } from 'react-native-svg';
import { mdiWalk } from '@mdi/js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import {
    Flame, Heart, HeartPulse, Award, Calendar,
    TrendingUp, Watch, Footprints, ShieldCheck,
    Activity, TrendingDown, Mountain
} from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8082' : 'http://localhost:8082';

export default function HealthMetricsScreen() {
    const [period, setPeriod] = useState('MONTH');

    const [liveData, setLiveData] = useState({
        heartRate: 0,
        stepCount: 0,
        altitude: 0
    });

    const [monthlyData, setMonthlyData] = useState({
        calories: 0,
        distance: 0,
        maxElevation: 0
    });

    // 🔥 1. 주차별 그래프용 상태 추가 [1주차, 2주차, 3주차, 이번주]
    const [weeklyChartData, setWeeklyChartData] = useState([0, 0, 0, 0]);

    const [aiSummary, setAiSummary] = useState("AI가 오늘의 건강 데이터를 분석하고 있습니다... 🤖");
    const [isAiLoading, setIsAiLoading] = useState(true);

    const stepGoal = 10000;

    const fetchLiveBiometrics = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/health/biometrics/latest`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.data) {
                setLiveData({
                    heartRate: response.data.heartRate || 0,
                    stepCount: response.data.stepCount || 0,
                    altitude: Math.round(response.data.altitude || 0)
                });
            }
        } catch (error) {
            console.log("라이브 데이터 로드 실패");
        }
    };

    const fetchMonthlyData = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/health/workout-summary/my`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const summaries = response.data || [];
            const currentMonth = new Date().getMonth();
            const thisMonthSummaries = summaries.filter(s => new Date(s.createdAt).getMonth() === currentMonth);

            let totalCal = 0;
            let totalDist = 0;
            let maxAlt = 0;

            // 🔥 2. 주차별 칼로리를 담을 빈 바구니 준비
            let weeklyCals = [0, 0, 0, 0];

            thisMonthSummaries.forEach(summary => {
                totalCal += summary.totalCalories || 0;
                totalDist += summary.totalDistance || 0;
                if (summary.maxAltitude > maxAlt) {
                    maxAlt = summary.maxAltitude;
                }

                // 🔥 3. 날짜를 계산해 해당 주차 바구니에 칼로리 누적
                const dateObj = new Date(summary.createdAt);
                if (!isNaN(dateObj.getTime())) {
                    const day = dateObj.getDate();
                    // 1~7일(0번 인덱스), 8~14일(1번), 15~21일(2번), 22일 이상(3번)
                    let weekIndex = Math.floor((day - 1) / 7);
                    if (weekIndex > 3) weekIndex = 3;

                    weeklyCals[weekIndex] += (summary.totalCalories || 0);
                }
            });

            setMonthlyData({
                calories: totalCal,
                distance: totalDist.toFixed(1),
                maxElevation: Math.round(maxAlt)
            });

            // 🔥 4. 계산된 배열을 그래프 상태에 업데이트
            setWeeklyChartData(weeklyCals);

        } catch (error) {
            console.log("월간 데이터 로드 실패");
        }
    };

    const fetchAiSummary = async () => {
        try {
            setIsAiLoading(true);
            const prompt = `오늘의 사용자 건강 데이터입니다: 걸음수 ${liveData.stepCount}보, 실시간 심박수 ${liveData.heartRate}bpm, 현재 고도 ${liveData.altitude}m. 이 수치들을 바탕으로 현재 등산/건강 상태를 종합 평가하는 긍정적이고 안전을 당부하는 한줄평을 작성해줘. (반드시 50자 이내로 짧게 작성할 것)`;

            const response = await axios.post(`${API_BASE_URL}/api/gemini/chat`, { message: prompt });
            setAiSummary(response.data.result);
        } catch (error) {
            setAiSummary("오늘은 안전에 유의하며 무리하지 않는 산행을 즐겨보세요! 🌲");
        } finally {
            setIsAiLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthlyData();
    }, []);

    useEffect(() => {
        fetchLiveBiometrics().then(() => {
            fetchAiSummary();
        });

        const intervalId = setInterval(() => {
            fetchLiveBiometrics();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <View className="flex-1 bg-white">
            <View className="pt-5 pb-4 px-5 border-b border-gray-50 flex-row justify-between items-center bg-white">
                <Text className="text-xl font-black text-gray-900">건강 지표</Text>
                <View className="bg-gray-100 px-2 py-1 rounded-md">
                    <Text className="text-[10px] font-bold text-gray-500">월간</Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="mx-5 mt-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5">
                        <View className="p-1.5 bg-blue-50 rounded-xl">
                            <Watch size={18} color="#2563EB" />
                        </View>
                        <View>
                            <Text className="text-xs font-bold text-gray-800">Galaxy Watch7 Ultra</Text>
                            <Text className="text-[10px] text-gray-400 font-medium">실시간 동기화 중</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <View className="w-1.5 h-1.5 bg-emerald-500 animate-pulse rounded-full" />
                        <Text className="text-[9px] font-bold text-emerald-700">LIVE 연동됨</Text>
                    </View>
                </View>

                <View className="p-5 bg-emerald-600/[0.03] mx-5 mt-4 mb-6 rounded-3xl border border-emerald-600/[0.05]">
                    <View className="flex-row items-center gap-1.5 mb-3">
                        <Calendar size={20} color="#059669" />
                        <Text className="text-xl font-bold text-emerald-700">이번 달 나의 등산 성적표</Text>
                    </View>

                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-xs font-bold text-gray-400 mb-0.5">소모 칼로리</Text>
                            <Text className="text-2xl font-black text-gray-900">
                                {monthlyData.calories.toLocaleString()} <Text className="text-sm font-bold text-gray-500">kcal</Text>
                            </Text>
                        </View>
                    </View>

                    <View className="h-[1px] bg-gray-200/60 my-2" />

                    <View className="flex-row items-center pt-2">
                        <View className="flex-1">
                            <Text className="text-[11px] font-bold text-gray-400 mb-0.5">누적 이동 거리</Text>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-base font-black text-gray-800 leading-none">
                                    {monthlyData.distance}km
                                </Text>
                                <Svg width={25} height={25} viewBox="0 0 24 24">
                                    <Path d={mdiWalk} fill="#065f46" />
                                </Svg>
                            </View>
                        </View>

                        <View className="w-[1px] h-8 bg-gray-200 mx-4" />

                        <View className="flex-1">
                            <Text className="text-[11px] font-bold text-gray-400 mb-0.5">최고 달성 고도</Text>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-base font-black text-gray-800 leading-none">
                                    {monthlyData.maxElevation.toLocaleString()}m
                                </Text>
                                <Mountain size={25} color="#065f46" />
                            </View>
                        </View>
                    </View>
                </View>

                <View className="px-5 mb-8">
                    <Text className="text-xl font-black text-gray-900 tracking-tight mb-5">
                        오늘의 워치 라이브 데이터
                    </Text>

                    <View className="gap-y-4">
                        <View className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100/70">
                            <View className="flex-row justify-between items-start mb-4">
                                <View>
                                    <Text className="text-[11px] text-gray-400 font-bold tracking-wide mb-1.5">오늘 걸음 수</Text>
                                    <Text className="text-2xl font-black text-gray-900">
                                        {liveData.stepCount.toLocaleString()}
                                        <Text className="text-sm text-gray-400 font-medium"> / {stepGoal.toLocaleString()}보</Text>
                                    </Text>
                                </View>
                                <View className="p-2.5 bg-indigo-50 rounded-2xl">
                                    <Footprints size={20} color="#4F46E5" />
                                </View>
                            </View>
                            <View className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <View
                                    className="bg-indigo-600 h-full rounded-full"
                                    style={{ width: `${Math.min((liveData.stepCount / stepGoal) * 100, 100)}%` }}
                                />
                            </View>
                        </View>

                        <View className="flex-row justify-between gap-3">
                            <View className="flex-1 flex-row items-center bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                                <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center mr-3">
                                    <Heart size={22} color="#DC2626" />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-[11px] text-gray-500 font-bold mb-0.5">실시간 심박수</Text>
                                        <View className="bg-red-100 px-1.5 py-0.5 rounded">
                                            <Text className="text-[8px] text-red-600 font-bold">LIVE</Text>
                                        </View>
                                    </View>
                                    <Text className="text-lg font-black text-gray-900">
                                        {liveData.heartRate} <Text className="text-xs font-semibold text-gray-400">bpm</Text>
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-1 flex-row items-center bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                                <View className="w-12 h-12 rounded-full bg-sky-50 items-center justify-center mr-3">
                                    <TrendingUp size={22} color="#0EA5E9" />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-[11px] text-gray-500 font-bold mb-0.5">현재 측정 고도</Text>
                                        <View className="bg-blue-100 px-1.5 py-0.5 rounded">
                                            <Text className="text-[8px] text-blue-600 font-bold">LIVE</Text>
                                        </View>
                                    </View>
                                    <Text className="text-lg font-black text-gray-900">
                                        {liveData.altitude.toLocaleString()} <Text className="text-xs font-semibold text-gray-400">m</Text>
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 🔥 5. 그래프 연동부 */}
                <View className="px-5 mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <View>
                            <Text className="text-xl font-black text-gray-900">활동량 추이 그래프</Text>
                            <Text className="text-[10px] font-bold text-gray-400 mt-0.5">월간 소모 칼로리 (단위: kcal)</Text>
                        </View>
                        <Text className="text-xs font-bold text-gray-400">{new Date().getMonth() + 1}월</Text>
                    </View>

                    <View className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-4 pt-6 items-center shadow-sm overflow-hidden">
                        <LineChart
                            data={{
                                labels: ["1주차", "2주차", "3주차", "이번주"],
                                datasets: [{
                                    // 그래프 에러 방지용: 모든 값이 0이면 가상의 미세한 값(0.1) 부여
                                    data: weeklyChartData.every(v => v === 0) ? [0.1, 0.1, 0.1, 0.1] : weeklyChartData,
                                    color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
                                    strokeWidth: 3
                                }]
                            }}
                            fromZero={true}
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
                            renderDotContent={({ x, y, index }) => {
                                const realValue = weeklyChartData[index];
                                return (
                                    <Text
                                        key={index}
                                        style={{
                                            position: "absolute", left: x - 25, top: y - 22, width: 50,
                                            fontSize: 9, fontWeight: "bold", color: "#059669", textAlign: "center"
                                        }}
                                    >
                                        {`${realValue} kcal`}
                                    </Text>
                                );
                            }}
                            bezier
                            withVerticalLines={false}
                            style={{ marginVertical: 4, borderRadius: 24, paddingLeft: 90, paddingRight: 40 }}
                        />
                    </View>
                </View>

                <View className="mx-5 mb-10 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex-row items-center gap-3">
                    <View className="p-2 bg-amber-100 rounded-xl self-start">
                        <Award size={20} color="#B45309" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-amber-900 mb-0.5">AI 스마트워치 종합 평가</Text>
                        <Text className="text-[12px] text-amber-800 font-bold leading-5 mt-1">
                            {isAiLoading ? "데이터를 종합하여 분석 중입니다... 🔄" : aiSummary}
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}