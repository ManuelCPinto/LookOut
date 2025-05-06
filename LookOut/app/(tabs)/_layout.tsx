import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import React from "react";
import {Slot} from "expo-router";
export default function TabsLayout() {
  return (
    <>
      <Header />
      <Slot />     
      <Navbar />
    </>
  );
}
