// assets/data/mountainData.js (예시 경로)

// 📸 각 코스별 로컬 이미지 require 정의
export const IMG_BUKHAN_C1 = require("../../../assets/images/bukhan_c1.jpg");
export const IMG_BUKHAN_C2 = require("../../../assets/images/bukhan_c2.jpg");
export const IMG_SEORAK_ULSAN = require("../../../assets/images/seorak.jpg");
export const IMG_HALLA_SEONGPANAK = require("../../../assets/images/bukhan_c1.jpg");
export const IMG_JIRI_CHEONWANG = require("../../../assets/images/bukhan_c1.jpg");
export const IMG_NAEJANG_TEMPLE = require("../../../assets/images/bukhan_c1.jpg");
export const a1 = require("../../../assets/images/a1.jpg");
export const a2 = require("../../../assets/images/a2.jpeg");
export const a3 = require("../../../assets/images/a3.jpeg");

// 🌲 산 코스 데이터
export const MOUNTAIN_DATA = {
    "1": [
        {
            id: 11, name: "북한산 백운대 코스", difficulty: "어려움", uptime: "2시간 30분", distance: "4.2km",
            description: "북한산의 최고봉 백운대를 오르는 코스로, 인수봉과 만경대의 절경을 감상할 수 있습니다.",
            imageSource: IMG_BUKHAN_C1,
            markers: [
                { id: 1, lat: 37.658186, lng: 126.99125, color: "#84a98c", title: "백운대 탐방지원센터" },
                { id: 2, lat: 37.662294, lng: 126.98619, color: "#84a98c", title: "하루재" },
                { id: 3, lat: 37.657932, lng: 126.97946, color: "#9381ff", title: "백운봉암문" },
                { id: 4, lat: 37.658616, lng: 126.97799, color: "#9381ff", title: "백운대 정상" }
            ],
            path: [
                { lat: 37.65819, lng: 126.99124 }, { lat: 37.65796, lng: 126.99139 }, { lat: 37.65821, lng: 126.99107 }, { lat: 37.65837, lng: 126.99091 },
                { lat: 37.65857, lng: 126.99063 }, { lat: 37.65882, lng: 126.99019 }, { lat: 37.65916, lng: 126.98985 }, { lat: 37.65959, lng: 126.98951 },
                { lat: 37.65993, lng: 126.98906 }, { lat: 37.66038, lng: 126.98866 }, { lat: 37.66088, lng: 126.98839 }, { lat: 37.66135, lng: 126.98802 },
                { lat: 37.66184, lng: 126.98771 }, { lat: 37.66222, lng: 126.98709 }, { lat: 37.66223, lng: 126.98702 }, { lat: 37.66228, lng: 126.98582 },
                { lat: 37.66189, lng: 126.98537 }, { lat: 37.66134, lng: 126.98505 }, { lat: 37.66075, lng: 126.98493 }, { lat: 37.66013, lng: 126.98494 },
                { lat: 37.65914, lng: 126.98395 }, { lat: 37.65872, lng: 126.98297 }, { lat: 37.65833, lng: 126.98207 }, { lat: 37.65847, lng: 126.98131 },
                { lat: 37.65807, lng: 126.98056 }, { lat: 37.65786, lng: 126.97978 }, { lat: 37.65761, lng: 126.97953 }, { lat: 37.65804, lng: 126.97919 },
                { lat: 37.65838, lng: 126.97831 }, { lat: 37.65879, lng: 126.97843 }, { lat: 37.65874, lng: 126.97800 }, { lat: 37.65872, lng: 126.97810 }
            ],
        },
        {
            id: 12, name: "북한산 원효봉 코스", difficulty: "쉬움", uptime: "1시간 30분", distance: "2.7km",
            description: "북한산 입문 코스로 추천하며, 원효봉 정상에서 바라보는 백운대와 만경대의 파노라마 뷰가 일품입니다.",
            imageSource: IMG_BUKHAN_C2,
            markers: [
                { id: 1, lat: 37.65517, lng: 126.94948, color: "#84a98c", title: "북한산성 탐방지원센터" },
                { id: 2, lat: 37.65347, lng: 126.95593, color: "#84a98c", title: "대서문" },
                { id: 3, lat: 37.65242, lng: 126.96230, color: "#84a98c", title: "북한동 역사관" },
                { id: 4, lat: 37.65754, lng: 126.96480, color: "#9381ff", title: "원효봉 정상" }
            ],
            path: [
                { lat: 37.65517, lng: 126.94948 }, { lat: 37.65508, lng: 126.94952 }, { lat: 37.65503, lng: 126.94962 }, { lat: 37.65499, lng: 126.94972 },
                { lat: 37.65495, lng: 126.94983 }, { lat: 37.65491, lng: 126.94994 }, { lat: 37.65485, lng: 126.95003 }, { lat: 37.6548, lng: 126.95016 },
                { lat: 37.65477, lng: 126.95027 }, { lat: 37.65475, lng: 126.95038 }, { lat: 37.65475, lng: 126.95051 }, { lat: 37.65479, lng: 126.95061 },
                { lat: 37.65485, lng: 126.95072 }, { lat: 37.65487, lng: 126.95083 }, { lat: 37.65489, lng: 126.95096 }, { lat: 37.65493, lng: 126.95106 },
                { lat: 37.65347, lng: 126.95593 }, { lat: 37.65356, lng: 126.95596 }, { lat: 37.65362, lng: 126.95605 }, { lat: 37.65364, lng: 126.95616 },
                { lat: 37.65361, lng: 126.95628 }, { lat: 37.65361, lng: 126.9564 }, { lat: 37.65373, lng: 126.95673 }, { lat: 37.65385, lng: 126.95692 },
                { lat: 37.65388, lng: 126.95716 }, { lat: 37.65392, lng: 126.95739 }, { lat: 37.65402, lng: 126.95784 }, { lat: 37.65378, lng: 126.95804 },
                { lat: 37.6533, lng: 126.95839 }, { lat: 37.65362, lng: 126.95876 }, { lat: 37.65392, lng: 126.95894 }, { lat: 37.65383, lng: 126.95941 },
                { lat: 37.65351, lng: 126.96012 }, { lat: 37.65314, lng: 126.96064 }, { lat: 37.65289, lng: 126.96128 }, { lat: 37.65276, lng: 126.96186 },
                { lat: 37.65242, lng: 126.9623 }, { lat: 37.65253, lng: 126.96277 }, { lat: 37.65313, lng: 126.96244 }, { lat: 37.65324, lng: 126.96375 },
                { lat: 37.65341, lng: 126.96429 }, { lat: 37.65377, lng: 126.96508 }, { lat: 37.65408, lng: 126.96562 }, { lat: 37.65422, lng: 126.96696 },
                { lat: 37.65782, lng: 126.96718 }, { lat: 37.65779, lng: 126.96706 }, { lat: 37.65777, lng: 126.96672 }, { lat: 37.6576, lng: 126.96623 },
                { lat: 37.65749, lng: 126.96581 }, { lat: 37.65741, lng: 126.96536 }, { lat: 37.65754, lng: 126.9648 }
            ],
        }
    ],
    "2": [
        {
            id: 13, name: "설악산 울산바위 코스", difficulty: "보통", uptime: "2시간", distance: "3.8km",
            description: "설악산의 상징과도 같은 기암괴석 울산바위에 오르는 대표적인 코스입니다.",
            imageSource: IMG_SEORAK_ULSAN,
            markers: [
                { id: 1, lat: 38.1734, lng: 128.4897, color: "#84a98c", title: "설악동 탐방지원센터" },
                { id: 2, lat: 38.1764, lng: 128.4715, color: "#84a98c", title: "흔들바위" },
                { id: 3, lat: 38.1812, lng: 128.4633, color: "#9381ff", title: "울산바위 정상" }
            ],
            path: [{ lat: 38.1734, lng: 128.4897 }, { lat: 38.1764, lng: 128.4715 }, { lat: 38.1812, lng: 128.4633 }]
        }
    ],
    "3": [
        {
            id: 15, name: "한라산 성판악 코스", difficulty: "어려움", uptime: "4시간 30분", distance: "9.6km",
            description: "백록담 정상을 정복할 수 있는 가장 대중적인 코스로, 완만한 경사가 길게 이어집니다.",
            imageSource: a1,
            markers: [
                { id: 1, lat: 33.3842, lng: 126.6212, color: "#84a98c", title: "성판악 입구" },
                { id: 2, lat: 33.3768, lng: 126.5684, color: "#84a98c", title: "진달래밭 대피소" },
                { id: 3, lat: 33.3617, lng: 126.5332, color: "#9381ff", title: "백록담 정상" }
            ],
            path: [{ lat: 33.3842, lng: 126.6212 }, { lat: 33.3768, lng: 126.5684 }, { lat: 33.3617, lng: 126.5332 }]
        }
    ],
    "4": [
        {
            id: 17, name: "지리산 천왕봉 최단 코스 (중산리)", difficulty: "어려움", uptime: "5시간", distance: "10.4km",
            description: "지리산 최고봉 천왕봉을 가장 빠르게 만날 수 있지만, 가파른 경사가 특징입니다.",
            imageSource: a2,
            markers: [
                { id: 1, lat: 35.3121, lng: 127.7552, color: "#84a98c", title: "중산리 탐방지원센터" },
                { id: 2, lat: 35.3289, lng: 127.7421, color: "#84a98c", title: "로타리 대피소" },
                { id: 3, lat: 35.3371, lng: 127.7305, color: "#9381ff", title: "천왕봉 정상" }
            ],
            path: [{ lat: 35.3121, lng: 127.7552 }, { lat: 35.3289, lng: 127.7421 }, { lat: 35.3371, lng: 127.7305 }]
        }
    ],
    "5": [
        {
            id: 19, name: "내장산 내장사 힐링 코스", difficulty: "쉬움", uptime: "1시간", distance: "3.0km",
            description: "단풍 터널을 지나 내장사까지 평탄하게 걷는 가족형 힐링 코스입니다.",
            imageSource: a3,
            markers: [
                { id: 1, lat: 35.4922, lng: 126.8831, color: "#84a98c", title: "내장산 매표소" },
                { id: 2, lat: 35.4955, lng: 126.8885, color: "#9381ff", title: "내장사" }
            ],
            path: [{ lat: 35.4922, lng: 126.8831 }, { lat: 35.4955, lng: 126.8885 }]
        }
    ]
};