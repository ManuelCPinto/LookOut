import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth }                  from "firebase/auth";
import { getReactNativePersistence }       from "firebase/auth"; 
import AsyncStorage                        from "@react-native-async-storage/async-storage";
import { getFirestore }                    from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyAGDRhhr8bdEgznfDAwx23CyJlLjaPcN5c",
  authDomain:        "lookout-c68a1.firebaseapp.com",
  projectId:         "lookout-c68a1",
  storageBucket:     "lookout-c68a1.firebasestorage.app",
  messagingSenderId: "88476785831",
  appId:             "1:88476785831:android:6ade2e3bea3edd1f48cf82",
};

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

  export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
