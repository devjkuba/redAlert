import {
  Flame,
  HeartPulse,
  DoorOpen,
  PlugZap,
  LogOut,
  AlertTriangle,
  SprayCan,
} from "lucide-react";
import { GunIcon } from "@/components/GunIcon";
import { GasIcon } from "@/components/GasIcon";
import { FightIcon } from "@/components/FightIcon";

export const Icons = {
  Flame,
  HeartPulse,
  DoorOpen,
  PlugZap,
  LogOut,
  AlertTriangle,
  SprayCan,
  GunIcon,
  GasIcon,
  FightIcon,
};

export const availableIcons: { name: string; icon: JSX.Element }[] = [
  { name: "Flame", icon: <Flame width={25} height={25} /> },
  { name: "HeartPulse", icon: <HeartPulse width={25} height={25} /> },
  { name: "DoorOpen", icon: <DoorOpen width={25} height={25} /> },
  { name: "PlugZap", icon: <PlugZap width={25} height={25} /> },
  { name: "LogOut", icon: <LogOut width={25} height={25} /> },
  { name: "AlertTriangle", icon: <AlertTriangle width={25} height={25}  /> },
  { name: "SprayCan", icon: <SprayCan width={25} height={25} /> },
  { name: "GunIcon", icon: <GunIcon width={25} height={25} /> },
  { name: "GasIcon", icon: <GasIcon width={25} height={25} /> },
  { name: "FightIcon", icon: <FightIcon width={25} height={25} /> },
];