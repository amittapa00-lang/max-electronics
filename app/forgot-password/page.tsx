"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email,setEmail] =
    useState("");

  async function sendOTP() {

    const res = await fetch(
      "/api/forgot-password",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify({
          email,
        }),
      }
    );

    const data =
      await res.json();

    if(res.ok){
      alert("ส่ง OTP แล้ว");
      router.push(
        `/reset-password?email=${email}`
      );
    }else{
      alert(data.error);
    }
  }

  return (
    <main className="max-w-md mx-auto py-20">

      <h1 className="text-3xl font-bold mb-6">
        ลืมรหัสผ่าน
      </h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e)=>
          setEmail(e.target.value)
        }
        className="w-full border p-3 rounded-lg mb-4"
      />

      <button
        onClick={sendOTP}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        ส่ง OTP
      </button>

    </main>
  );
}