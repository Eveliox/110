"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sound } from "@/lib/sound";

/** Sound stays off unless the visitor asks for it; the choice is remembered on this device. */
export function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const unsubscribe = sound.subscribe(setOn);
    // A returning visitor who turned sound on gets it back on their first interaction.
    let remembered = false;
    try { remembered = localStorage.getItem("110-sound") === "on"; } catch { /* storage unavailable */ }
    const resume = () => { void sound.setEnabled(true); };
    if (remembered) window.addEventListener("pointerdown", resume, { once: true });
    return () => { unsubscribe(); window.removeEventListener("pointerdown", resume); };
  }, []);
  const toggle = () => {
    const next = !on;
    void sound.setEnabled(next);
    try { localStorage.setItem("110-sound", next ? "on" : "off"); } catch { /* storage unavailable */ }
  };
  return <button className="sound-toggle" onClick={toggle} aria-pressed={on} aria-label={on ? "Turn sound off" : "Turn sound on"}>
    {on ? <Volume2 size={15} /> : <VolumeX size={15} />}<span>{on ? "Sound on" : "Sound"}</span>
  </button>;
}
