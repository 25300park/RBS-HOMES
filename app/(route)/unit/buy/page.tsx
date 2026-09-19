import { permanentRedirect } from "next/navigation";

export default function UnitBuyRedirect() {
  permanentRedirect("/list?sellType=sale&activeTypes=sale");
}
