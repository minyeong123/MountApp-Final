export const MATE_DETAIL_DATA = [
    {
        id: 1,
        title: "북한산 백운대 정복! 함께 오르실 분 구해요 🏔️",
        mountainName: "북한산 백운대 일출 산행",
        elevation: 836,
        status: "모집 중",
        deadline: "D-15",
        tags: [
            { label: "초보환영", color: "green" },
            { label: "뒷풀이있음", color: "orange" }
        ],
        description: "산타는고양이 이번 주말 백운대 일출 보러 가실 분 구해요! 하산 후 맛있는 두부김치랑 막걸리 한 잔 어떠세요? 📸 인생샷 찍어드립니다.",
        meeting: {
            date: "3월 12일 (토) 오전 9:00",
            location: "북한산우이역 2번 출구 앞"
        },
        course: {
            name: "백운대 탐방지원센터 코스",
            duration: "왕복 약 4시간",
            difficulty: "중급",
            distance: "4.2km",
            image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=600",
            description: "탐방지원센터에서 시작하여 하루재를 거쳐 백운대 대피소, 그리고 정상인 백운대까지 이어지는 코스입니다."
        },
        host: {
            name: "산타는 고양이",
            rating: 4.9,
            experience: "5년차",
            authCount: 24,
            bio: "안녕하세요! 안전하고 즐거운 산행을 지향함",
            profileImg: "https://i.pravatar.cc/150?u=santa"
        },
        members: {
            current: 2,
            max: 5,
            list: [
                { name: "김철수", profileImg: "https://i.pravatar.cc/150?u=1" },
                { name: "이영희", profileImg: "https://i.pravatar.cc/150?u=2" },
            ]
        },
        items: [
            { icon: '👟', label: '등산화' },
            { icon: '💧', label: '물 (1L)' },
            { icon: '🏔️', label: '장갑' },
            { icon: '🍏', label: '개인간식' }
        ],
        schedule: [
            { time: '09:00', title: '집결 및 인원 파악', desc: '북한산우이역 2번 출구 앞에서 만나요.' },
            { time: '09:30', title: '등산 시작', desc: '가볍게 스트레칭 후 출발합니다.' },
            { time: '12:00', title: '백운대 정상 점심', desc: '각자 싸온 도시락으로 점심 식사' },
            { time: '15:00', title: '하산 완료 및 뒷풀이', desc: '희망자에 한해 인근 파전집으로 이동' }
        ],
        notices: [
            "기상 악화 시 일정이 취소되거나 변경될 수 있습니다.",
            "노쇼(No-Show) 방지를 위해 신중하게 신청해 주세요.",
            "사고 시 주최자는 책임지지 않습니다.",
            "등산화 미착용 시 안전을 위해 참여가 제한될 수 있습니다."
        ]
    },
    {
        id: 2,
        title: "관악산 연주대 코스", // 이미지에 나온 제목 그대로
        mountainName: "관악산 연주대 코스",
        elevation: 629,
        status: "모집 중",
        deadline: "D-25", // 이미지에 나온 D-25
        // 리스트용 데이터 (사진 정보 기반)
        user: "트레킹마스터", // 이미지에 나온 유저명
        time: "30분 전", // 이미지에 나온 시간
        level: "상급", // 이미지에 나온 상급 배지
        // description은 리스트에서 사용되는 짧은 버전
        description: "트레킹마스터 관악산 연주대 찍고 사당으로 내려오는 코스입니다.\n" +
            "페이스를 조금 있게 탈 예정이라 어느 정도 경험 있으신 분들 환영합니다.\n" +
            "초보자분들은 다소 힘들 수 있어요.", // 이미지에 나온 설명 + '더보기' 전까지
        tags: [ // 이미지에 나온 태그들
            { label: "관악산", color: "blue" }, // 리스트에 보이는 파란색 태그처럼
            { label: "운동", color: "blue" },
            { label: "빠른페이스", color: "blue" }
        ],
        participants: "1/4명 참여중", // 이미지에 나온 참여 인원
        image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800", // 이미지와 동일한 사진

        // 상세 페이지용 데이터 (기존 형식 유지)
        meeting: {
            date: "3월 20일 (일) 오전 10:00",
            location: "사당역 4번 출구 앞"
        },
        course: {
            duration: "4시간 소요", // 이미지에 나온 4시간 소요
            difficulty: "상급",
            distance: "7.5km 코스", // 이미지에 나온 7.5km 코스
            image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800",
            description: "사당역에서 출발하여 깔딱고개를 지나 연주대 정상까지 오르는 강도 높은 코스입니다."
        },
        host: {
            name: "트레킹마스터",
            rating: 4.8,
            experience: "8년차",
            authCount: 156,
            bio: "지치지 않는 체력! 함께 한계에 도전하실 분?",
            profileImg: "https://i.pravatar.cc/150?u=trekking"
        },
        members: {
            current: 3,
            max: 5,
            list: [
                { name: "김철수", profileImg: "https://i.pravatar.cc/150?u=1" },
                { name: "이영희", profileImg: "https://i.pravatar.cc/150?u=2" },
                { name: "박민수", profileImg: "https://i.pravatar.cc/150?u=3" }
            ]
        },
        items: [
            { icon: '👟', label: '등산화' },
            { icon: '🥤', label: '이온음료' },
            { icon: '🍫', label: '에너지바' }
        ],
        schedule: [
            { time: '10:00', title: '사당역 집결', desc: '사당역 4번 출구에서 인원 파악 후 출발' },
            { time: '10:15', title: '산행 시작', desc: '관음사 방향으로 빠른 속도로 이동' },
            { time: '12:00', title: '연주대 도착', desc: '정상 인증 및 짧은 휴식' },
            { time: '13:30', title: '하산 완료', desc: '낙성대/서울대 방향 하산 후 해산' }
        ],
        notices: [
            "등산화와 장갑 필수 착용입니다.",
            "페이스가 빠르므로 초보자분들은 고려해 주세요.",
            "개인 안전 사고에 유의해 주시기 바랍니다."
        ]
    }
];