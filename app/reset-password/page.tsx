"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {

  const params =
    useSearchParams();

  const router =
    useRouter();

  const email =
    params.get("email") || "";

  const [otp,setOtp] =
    useState("");

  const [password,setPassword] =
    useState("");

  async function resetPassword(){

    const res = await fetch(
      "/api/reset-password",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify({
          email,
          otp,
          password,
        }),
      }
    );

    const data =
      await res.json();

    if(res.ok){

      alert(
        "เปลี่ยนรหัสผ่านสำเร็จ"
      );

      router.push(
        "/login"
      );

    }else{

      alert(
        data.error
      );

    }
  }

  return (
    <main className="max-w-md mx-auto py-20">

      <h1 className="text-3xl font-bold mb-6">
        ตั้งรหัสผ่านใหม่
      </h1>

      <input
        value={otp}
        onChange={(e)=>
          setOtp(e.target.value)
        }
        placeholder="OTP"
        className="w-full border p-3 rounded-lg mb-4"
      />

      <input
        type="password"
        value={password}
        onChange={(e)=>
          setPassword(
            e.target.value
          )
        }
        placeholder="รหัสผ่านใหม่"
        className="w-full border p-3 rounded-lg mb-4"
      />

      <button
        onClick={resetPassword}
        className="w-full bg-green-600 text-white py-3 rounded-lg"
      >
        เปลี่ยนรหัสผ่าน
      </button>

    </main>
  );
}