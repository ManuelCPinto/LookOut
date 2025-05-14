import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  signUpApi,
  sendVerificationApi,
  reloadUserApi,
  signOutApi,
} from "@/lib/auth";
import { createUserProfileApi } from "@/lib/user";
import type { User } from "firebase/auth";

export function useSignUp() {
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const router                        = useRouter();

  /**
   * Creates the Auth user & send verification.
   *
   * @param email    – user’s email
   * @param password – user’s password
   */
  async function signUp(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const cred = await signUpApi(email, password);
      await sendVerificationApi(cred.user);
      setPendingUser(cred.user);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  /**
   * When user taps “I’ve Confirmed”, reload & check.
   *
   * If verified, creates their profile, signs them out,
   * and navigates back to the login page.
   *
   * @param username – chosen username for their profile
   * @param email    – their email address
   */
  async function checkVerified(username: string, email: string) {
    if (!pendingUser) return;
    setLoading(true);
    try {
      await reloadUserApi(pendingUser);
      if (pendingUser.emailVerified) {
        await createUserProfileApi(
          pendingUser.uid,
          username.trim(),
          email.trim()
        );
        await signOutApi();
        router.replace("/login");
      } else {
        Alert.alert(
          "Still Not Verified",
          "We don't see your email as verified yet. " +
            "Please click the link in your inbox then tap “I’ve Confirmed.”"
        );
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Resend the verification link if needed.
   */
  async function resendVerification() {
    if (!pendingUser) return;
    setLoading(true);
    try {
      await sendVerificationApi(pendingUser);
      Alert.alert("Email Sent", "A new verification link has been sent.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    pendingUser,
    loading,
    error,
    signUp,
    checkVerified,
    resendVerification,
  };
}
