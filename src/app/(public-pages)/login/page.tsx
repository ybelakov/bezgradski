"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { BusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import SelectLanguage from "~/app/_components/SelectLanguage";
import { Label } from "~/components/ui/label";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="fixed inset-0 z-40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/background-bg.jpg"
            alt="Background"
            fill
            priority
            quality={100}
            className="object-cover"
            style={{ filter: "blur(8px)" }}
          />
        </div>

        <Dialog open>
          <DialogContent className="flex flex-col justify-center" hideXIcon>
            <div className="rounded-lg bg-white p-6 sm:p-8 dark:bg-gray-800">
              <DialogTitle className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
                <div className="absolute top-1 left-2 flex flex-row items-center gap-1 text-lg">
                  <BusIcon />
                  {t("app_name")}
                </div>
                {t("login_title")}
              </DialogTitle>

              <div className="mt-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                          fill="#EA4335"
                        />
                        <path
                          d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.25 12.0004 19.25C8.8704 19.25 6.2154 17.14 5.2654 14.295L1.27539 17.39C3.25539 21.31 7.3104 24 12.0004 24Z"
                          fill="#34A853"
                        />
                      </svg>
                      <span>{t("login_with_google")}</span>
                    </>
                  )}
                </button>
                <div className="mt-4 flex justify-center">
                  <SelectLanguage />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
