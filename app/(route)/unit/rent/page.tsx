import { permanentRedirect } from "next/navigation";

export default function UnitRentRedirect() {
  permanentRedirect("/list?sellType=rent&activeTypes=rent");
}
