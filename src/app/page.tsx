"use client"
import { RedocStandalone } from "redoc"

export default function Home() {
  return (
  <RedocStandalone specUrl={"/api.spec.yaml"}/>
  );
}
