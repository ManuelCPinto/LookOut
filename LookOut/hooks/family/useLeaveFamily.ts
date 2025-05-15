import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "@/lib/firebase";
import {
  deleteFamily,
  removeUserFromFamily,
} from "@/lib/family";

/**
 * Returns a callback that will either delete the family
 * (if owner) or remove the current user from it.
 *
 * @param familyId – ID of the family document
 * @param isOwner  – true if current user is the owner
 * @returns       A function to invoke the leave/delete flow
 */


export function useLeaveFamily(familyId: string, isOwner: boolean) {
  const router = useRouter();
  const uid    = auth.currentUser!.uid;

  return () => {
    if (isOwner) {
      Alert.alert(
        "Delete Family?",
        "This will delete the entire family. Cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await deleteFamily(familyId);
              router.replace("/profile");
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Leave Family?",
        "You will be removed and lose access.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: async () => {
              await removeUserFromFamily(familyId, uid);
              router.replace("/profile");
            },
          },
        ]
      );
    }
  };
}
