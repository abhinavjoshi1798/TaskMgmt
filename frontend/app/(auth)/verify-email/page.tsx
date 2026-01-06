"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Result, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Link from "next/link";
import { verifyEmailAction } from "@/actions/authActions";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your email address...");

  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (hasVerified.current) return;

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. Token is missing.");
        return;
      }

      hasVerified.current = true;

      const res = await verifyEmailAction(token);

      if (res?.status) {
        setStatus("success");
        setMessage(res.message);
      } else {
        setStatus("error");
        setMessage(res.message);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-gray-100 text-center">
      {status === "loading" && (
        <div className="py-10">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          />
          <h2 className="mt-6 text-xl font-semibold text-gray-800">
            Please wait...
          </h2>
          <p className="mt-2 text-gray-500">{message}</p>
        </div>
      )}

      {status === "success" && (
        <Result
          status="success"
          title="Email Verified!"
          subTitle={message}
          extra={[
            <Link href="/login" key="login">
              <Button
                type="primary"
                size="large"
                className="bg-blue-600 hover:bg-blue-500"
              >
                Go to Login
              </Button>
            </Link>,
          ]}
        />
      )}

      {status === "error" && (
        <Result
          status="error"
          title="Verification Failed"
          subTitle={message}
          extra={[
            <Link href="/login" key="back">
              <Button size="large">Back to Login</Button>
            </Link>,
          ]}
        />
      )}
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-gray-100 text-center">
      <div className="py-10">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <h2 className="mt-6 text-xl font-semibold text-gray-800">
          Please wait...
        </h2>
        <p className="mt-2 text-gray-500">Loading verification page...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
