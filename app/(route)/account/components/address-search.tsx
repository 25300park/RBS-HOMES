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
    const initializeAutocomplete = async () => {
      await loadGoogleMapsAPI(); // Google Maps 스크립트 비동기 로드

      if (!inputRef.current) return;

      // Google Places Autocomplete 초기화
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["address"], // 주소 검색만 가능하도록 설정
          componentRestrictions: { country: "PH" }, // 필리핀으로 검색 제한
        }
      );

      // 장소가 선택되었을 때 실행되는 함수
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace(); // 사용자가 선택한 장소 정보

        if (!place.address_components || !place.geometry) {
          window.alert(
            "No detailed address or location information available."
          );
          return;
        }

        // 주소 컴포넌트에서 모든 주소 정보를 수집
        const addressComponents = place.address_components.reduce(
          (acc: any, component: any) => {
            const types = component.types;

            if (types.includes("postal_code"))
              acc.postalCode = component.long_name; // 우편번호
            if (types.includes("locality")) acc.city = component.long_name; // 도시
            if (types.includes("administrative_area_level_1"))
              acc.region = component.long_name; // 지역
            if (
              types.includes("sublocality") ||
              types.includes("sublocality_level_1")
            ) {
              acc.subLocality = component.long_name; // 세부 구역
            }
            if (types.includes("route"))
              acc.streetAddress = component.long_name; // 도로명

            return acc;
          },
          {
            postalCode: "",
            city: "",
            region: "",
            streetAddress: "",
            subLocality: "",
          }
        );

        // 도시와 지역을 결합하여 "Manila, Metro Manila" 형식으로 만듦
        const cityWithRegion = `${addressComponents.city}, ${addressComponents.region}`;

        // `formatted_address`는 전체 주소를 반환
        const formattedAddress = place.formatted_address || "";

        // 위도와 경도 추출
        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();

        // 폼 상태 업데이트
        setFormData({
          ...formData,
          address1: addressComponents.postalCode || "", // 우편번호
          address2: cityWithRegion || "", // 도시와 지역 결합
          address3: addressComponents.streetAddress || "", // 도로명
          address4: addressComponents.subLocality || "", // 세부 구역 (예: Ermita)
          latitude: latitude, // 위도
          longitude: longitude, // 경도
          fullAddress: formattedAddress, // 전체 주소 저장
        });

        // 검색어 필드 업데이트 (풀 주소 표시)
        setSearchTerm(formattedAddress); // 검색어를 선택된 전체 주소로 변경

        // 정적 지도 이미지 URL 생성
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7Clabel:A%7C${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_KEY}`;
        setStaticMapUrl(staticMapUrl); // 정적 지도 이미지 URL 저장
      });
    };

    initializeAutocomplete(); // Autocomplete 초기화
  }, [inputRef, formData, setFormData]); // 종속성 배열에 폼 상태 포함

  return (
    <div className="address-search">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <FaMapMarkerAlt className="text-[#0eb8c5] mr-2" />
        Address Search
      </h2>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search address (Philippines only)"
          className="pl-10"
        />
      </div>
      {/* 우편번호 */}
      <Input
        type="text"
        name="address1"
        value={formData.address1}
        readOnly={true} // 입력 불가, 자동완성된 값만 표시
        placeholder="Postal Code"
      />

      {/* 도시와 지역 */}
      <Input
        type="text"
        name="address2"
        value={formData.address2}
        readOnly={true} // 입력 불가, 자동완성된 값만 표시
        placeholder="City and Region"
      />

      {/* 도로명 */}
      <Input
        type="text"
        name="address3"
        value={formData.address3}
        readOnly={true} // 입력 불가, 자동완성된 값만 표시
        placeholder="Street Address"
      />

      {/* 세부 구역 (예: Ermita) */}
      <Input
        type="text"
        name="address4"
        value={formData.address4}
        readOnly={true} // 입력 불가, 자동완성된 값만 표시
        placeholder="Sub-locality (Barangay or District)"
      />

      {/* 사용자가 입력할 상세 주소 */}
      <Input
        type="text"
        name="addressSelf"
        value={formData.addressSelf}
        onChange={(e) =>
          setFormData({ ...formData, addressSelf: e.target.value })
        } // 수정 가능
        placeholder="Additional Address Info (Building, Floor, Unit)"
      />

      {/* 정적 지도 이미지 표시 */}
      {staticMapUrl && (
        <div className="mt-4">
          <img src={staticMapUrl} alt="Selected location" />
        </div>
      )}
    </div>
  );
}
