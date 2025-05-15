import { useRef } from "react";
import * as Animatable from "react-native-animatable";

/** 
 * Provides refs and animation methods to control the slide-up modal sheet.
 * Call `slideIn()` to open and `slideOut()` to close.
 */
export function useDeviceModal() {
  const sheetRef = useRef<Animatable.View & any>(null);

  function slideIn() {
    sheetRef.current?.slideInUp(300);
  }

  function slideOut(onDone?: () => void) {
    sheetRef.current?.slideOutDown(200).then(onDone);
  }

  return { sheetRef, slideIn, slideOut };
}
