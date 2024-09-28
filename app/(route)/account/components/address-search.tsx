import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { loadGoogleMapsAPI } from "@/lib/google";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";

export default function AddressSearch({ formData, setFormData }: any) {
  const [searchTerm, setSearchTerm] = useState(""); // 입력된 검색어 상태 관리
  const [staticMapUrl, setStaticMapUrl] = useState(""); // 정적 지도 이미지 URL 관리
  const inputRef = useRef<HTMLInputElement | null>(null); // Input 요소 참조

  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${formData.latitude},${formData.longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7Clabel:A%7C${formData.latitude},${formData.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_KEY}`;
      setStaticMapUrl(staticMapUrl);
    }
  }, [formData.latitude, formData.longitude]);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      await loadGoogleMapsAPI(); // Google Maps 스크립트 비동기 로드

      if (!inputRef.current) return;

      // Google Places Autocomplete 초기화
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country: "PH" }, // 필리핀으로 제한
          language: "en", // 영어로만 결과 표시
        }
      );

      // 장소가 선택되었을 때 실행되는 함수
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.address_components || !place.geometry) {
          window.alert(
            "No detailed address or location information available."
          );
          return;
        }

        // 주소 컴포넌트 추출
        const addressComponents = place.address_components.reduce(
          (acc: any, component: any) => {
            const types = component.types;

            // 우편번호
            if (types.includes("postal_code"))
              acc.postalCode = component.long_name;

            // 도시
            if (types.includes("locality") || types.includes("sublocality"))
              acc.city = component.long_name;

            // 지역 (예: Metro Manila)
            if (types.includes("administrative_area_level_1"))
              acc.region = component.long_name;

            // 모든 도로명을 결합하여 저장
            if (
              types.includes("route") ||
              types.includes("intersection") ||
              types.includes("premise") ||
              types.includes("street_number")
            ) {
              acc.streetAddress.push(component.long_name);
            }

            return acc;
          },
          {
            postalCode: "",
            city: "",
            region: "",
            streetAddress: [], // 배열로 수정하여 여러 도로명 저장
          }
        );

        // 도로명을 결합하여 문자열로 변환
        const fullStreetAddress = addressComponents.streetAddress.join(", ");

        // 전체 주소 형식
        const formattedAddress = place.formatted_address || "";

        // 위도와 경도 추출
        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();

        // 폼 상태 업데이트
        setFormData({
          ...formData,
          loaction: formattedAddress,
          address1: addressComponents.postalCode || "", // 우편번호
          address2:
            `${addressComponents.city}, ${addressComponents.region}` || "", // 도시와 지역 결합
          address3: fullStreetAddress || "", // 나머지 모든 도로명 정보
          latitude: latitude, // 위도
          longitude: longitude, // 경도
          fullAddress: formattedAddress, // 전체 주소 저장
        
        });

        // 검색어 필드 업데이트
        setSearchTerm(formattedAddress); // 검색어를 선택된 전체 주소로 변경

        // 정적 지도 이미지 URL 생성
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7Clabel:A%7C${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_KEY}`;
        setStaticMapUrl(staticMapUrl);
      });
    };

    initializeAutocomplete();
  }, [inputRef, formData, setFormData]);

  // 검색어 변경 핸들러: 공백 제거 후 검색어 업데이트
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const trimmedValue = e.target.value.replace(/\s+/g, " "); // 연속된 공백을 단일 공백으로 대체
    setSearchTerm(trimmedValue);
  };

  return (
    <div className="">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <FaMapMarkerAlt className="text-orange-500 mr-2" />
        Address Search
      </h2>
      <div className="flex gap-6">
        <section className="flex-1">
          <div className="relative mb-2">
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Search Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-orange-400" />
              </div>
              <Input
                ref={inputRef}
                type="text"
                value={searchTerm || ""}
                onChange={handleSearchChange} // 검색어 변경 핸들러로 연결
                placeholder="Search address (Philippines only)"
                className="pl-10 border-orange-400 focus-visible:ring-orange-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 정적 지도 이미지 표시 */}
          {staticMapUrl ? (
            <div className="w-full h-[300px]">
              <img
                src={staticMapUrl}
                alt="Selected location"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No map available</span>
            </div>
          )}
        </section>

        <section className="flex-1 space-y-4">
          {/* 우편번호 */}
          <div className="">
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Postal Code
            </label>
            <Input
              type="text"
              name="address1"
              value={formData.address1 || ""}
              readOnly={true} // 입력 불가, 자동완성된 값만 표시
              placeholder="Postal Code"
              disabled
            />
          </div>

          {/* 도시와 지역 */}
          <div className="">
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              City and Region
            </label>
            <Input
              type="text"
              name="address2"
              value={formData.address2 || ""}
              readOnly={true} // 입력 불가, 자동완성된 값만 표시
              placeholder="City and Region"
              disabled
            />
          </div>

          {/* 도로명 */}
          <div className="">
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Street Address
            </label>
            <Input
              type="text"
              name="address3"
              value={formData.address3 || ""}
              readOnly={true} // 입력 불가, 자동완성된 값만 표시
              placeholder="Street Address"
              disabled
            />
          </div>

          {/* 세부 구역 (예: Ermita) */}
          <div className="">
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Sub-locality (Barangay or District)
            </label>
            <Input
              type="text"
              name="address4"
              value={formData.address4 || ""}
              readOnly={true} // 입력 불가, 자동완성된 값만 표시
              placeholder="Sub-locality (Barangay or District)"
              disabled
            />
          </div>

          {/* 사용자가 입력할 상세 주소 */}
          <div className="">
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Additional Address Info
            </label>
            <Input
              type="text"
              name="addressSelf"
              value={formData.addressSelf || ""}
              onChange={(e) =>
                setFormData({ ...formData, addressSelf: e.target.value })
              } // 수정 가능
              placeholder="Additional Address Info (Building, Floor, Unit)"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
