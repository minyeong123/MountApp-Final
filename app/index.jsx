// app/index.jsx
import React from "react";
import LoginPage from "../src/pages/auth/LoginPage"; // app 폴더 기준 src는 한 단계 위

export default function AppEntry() {
    return <LoginPage />;
}