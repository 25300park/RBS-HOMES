'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Home, Building, TrendingUp, ArrowRight, List, MapPin, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import MainSearchBar from "@/components/ui/main-search-bar";

interface SearchHistory {
  term: string;
  timestamp: number;
}

interface PopularCity {
  name: string;
  image: string;
}

const POPULAR_CITIES: PopularCity[] = [
  { name: "BGC", image: "/assets/images/cities/BGC.png" },
  { name: "Makati", image: "/assets/images/cities/Makati.png" },
  { name: "Mandaluyong", image: "/assets/images/cities/Mandaluyong.png" },
  { name: "Manila", image: "/assets/images/cities/manila.jpg" },
  { name: "Muntinlupa", image: "/assets/images/cities/Muntinlupa.png" },
  { name: "Pasay", image: "/assets/images/cities/Pasay.png" },
  { name: "Pasig", image: "/assets/images/cities/Pasig.png" },
  { name: "Quezon", image: "/assets/images/cities/Quezon.png" },
];

const HeroSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [searchValue, setSearchValue] = useState<string>(() => {
    return searchParams?.get("search") || "";
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"location" | "recent">("location");
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  useEffect(() => {
    const savedHistory = typeof window !== 'undefined' ? localStorage.getItem("searchHistory") : null;
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    const handleScroll = () => {
      setIsExpanded(false);
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSearch = (searchTerm: string, type: 'map' | 'list' = 'list') => {
    setSearchValue(searchTerm);
    
    if (searchTerm.trim()) {
      const newHistory = [
        { term: searchTerm, timestamp: Date.now() },
        ...searchHistory.filter((item) => item.term !== searchTerm),
      ].slice(0, 5);

      setSearchHistory(newHistory);
      if (typeof window !== 'undefined') {
        localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      }
      
      router.push(`/${type}?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push(`/${type}`);
    }

    setIsExpanded(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchValue, 'list');
    }
  };

  const categories = [
    {
      id: 'rent',
      title: 'Rent',
      description: 'Find your perfect rental',
      details: 'From studios to family homes',
      icon: <Home className="w-6 h-6 text-orange-500" />,
      link: '/map?activeTypes=rent',
      badge: "Hot"
    },
    {
      id: 'buy',
      title: 'Buy',
      description: 'Discover properties for sale',
      details: 'Investment & residential options',
      icon: <Building className="w-6 h-6 text-orange-500" />,
      link: '/map?activeTypes=sale'
    },
    {
      id: 'presale',
      title: 'Pre-Sale',
      description: 'New development projects',
      details: 'Latest pre-construction units',
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
      link: '/map?activeTypes=preSale',
      badge: 'New'
    }
  ];

  return (
    <>
      <div className="heading-home-section-desktop">
        <div className="bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8" ref={containerRef}>
              <div className="relative max-w-2xl mx-auto">
                <div className="relative bg-white rounded-2xl shadow-lg border">
                  <div className="flex items-center">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search area in the Philippines"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setIsExpanded(true)}
                      className="w-full pl-14 pr-24 py-4 text-lg border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-transparent"
                    />
                    
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                      <button
                        onClick={() => handleSearch(searchValue, 'list')}
                        className="w-10 h-10 bg-gray-100 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all duration-200 group"
                        title="Search in List View"
                      >
                        <List className="w-4 h-4 text-gray-600 group-hover:text-white" />
                      </button>
                      <button
                        onClick={() => handleSearch(searchValue, 'map')}
                        className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-all duration-200 group shadow-md"
                        title="Search on Map"
                      >
                        <MapPin className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-2 border z-50">
                      {/* Tab Navigation */}
                      <div className="flex border-b">
                        <button
                          className={`flex-1 px-6 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                            activeTab === "location" 
                              ? "border-orange-500 text-orange-600" 
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                          onClick={() => setActiveTab("location")}
                        >
                          <MapPin className="w-4 h-4" />
                          Popular Cities
                        </button>
                        <button
                          className={`flex-1 px-6 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                            activeTab === "recent" 
                              ? "border-orange-500 text-orange-600" 
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                          onClick={() => setActiveTab("recent")}
                        >
                          <Search className="w-4 h-4" />
                          Recent Searches
                        </button>
                      </div>

                      <div className="p-4 max-h-80 overflow-y-auto">
                        {activeTab === "location" ? (
                          <div className="grid grid-cols-3 gap-4">
                            {POPULAR_CITIES.map((city) => (
                              <button
                                key={city.name}
                                onClick={() => handleSearch(city.name, 'list')}
                                className="relative group overflow-hidden rounded-lg aspect-video hover:shadow-md transition-all"
                              >
                                <img
                                  src={city.image}
                                  alt={city.name}
                                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://via.placeholder.com/300x200/f97316/ffffff?text=${encodeURIComponent(city.name)}`;
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <h3 className="text-white text-sm font-semibold">
                                    {city.name}
                                  </h3>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {searchHistory.length > 0 ? (
                              searchHistory.map(({ term }) => (
                                <button
                                  key={term}
                                  className="w-full flex items-center px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                  onClick={() => handleSearch(term, 'list')}
                                >
                                  <Search className="text-gray-400 mr-3 text-sm flex-shrink-0" />
                                  <span className="text-gray-700">{term}</span>
                                </button>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Search className="text-3xl mb-3" />
                                <p>No recent searches</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-10">
              <div className="col-span-7 space-y-4">
                <div className="grid gap-4 grid-cols-3">
                  {categories.map((category) => (
                    <Link
                    href={category.link}
                      key={category.id}
                      className="relative bg-white  border border-gray-200  rounded-xl p-6 transition-all duration-300 cursor-pointer group"
                    >
                      {category.badge && (
                        <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {category.badge}
                        </span>
                      )}
                      <div className="flex flex-col space-y-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          {category.icon}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-gray-800">{category.title}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          <p className="text-xs text-gray-500">{category.details}</p>
                        </div>
                        <div className="flex justify-end">
                          <div className="w-8 h-8 bg-gray-100 group-hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors">
                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

      
                <div className="grid gap-4 grid-cols-2">
                  <Link href={"/list"} className="bg-white  border border-gray-200 rounded-xl p-4 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <List className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-base font-semibold text-gray-800">View as List</h4>
                          <p className="text-sm text-gray-500">Browse all properties</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gray-100 group-hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors">
                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
                      </div>
                    </div>
                  </Link>

                  <Link href={"/map"} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl p-4 transition-all duration-300 group shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <MapPin className="w-5 h-5 text-white animate-bounce" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-base font-semibold text-white">View on Map</h4>
                          <p className="text-sm text-orange-100">Explore locations</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="col-span-3">
                <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-6 translate-x-6"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/20 rounded-full translate-y-4 -translate-x-4"></div>
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Find Your</h3>
                      <h4 className="text-2xl font-bold mb-3">Dream Home</h4>
                      <p className="text-sm opacity-90 mb-4">
                        Discover premium properties across the Philippines
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>1000+ Properties</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Expert Consultation</span>
                      </div>
                      
                      <button className="bg-white text-orange-500 px-4 py-2 rounded-lg font-medium text-sm  transition-colors mt-4">
                        View All Properties
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="heading-home-section-mobile">
          <div className="max-w-6xl mx-auto p-3 border-b border-gray-200">
              <div className="flex">
                <div className="size-14 grow">
                  <img src="/assets/images/rbs-logo.png" alt="logo" className="w-42 h-auto float-left mt-1"/>
                </div>
                <div className="size-14 grow">
                  <div className="w-fit float-right mt-2">
                    <MainSearchBar isMobile />
                  </div>
                </div>
              </div>
          </div>

          <div className="max-w-6xl mx-auto p-3">
              <div className="grid grid-flow-col grid-rows-3 gap-3">  
                <div className="row-span-2 p-12 h-auto px-5 border border-gray-200 rounded-xl bg-white transition-all duration-300 cursor-pointer group relative">
                  <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Hot
                  </span>
                  <a href="https://rbs-homes.com/map?activeTypes=rent" target="_self">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow mx-auto">
                        <Home className="w-6 h-6 text-orange-500" />
                    </div>
                    <h6 className="text-base font-bold text-gray-800 text-center mt-6">
                      Rent
                    </h6>
                  </a>
                </div>
                <div className="col-span-2 row-start-1 p-6 h-auto border border-gray-200  rounded-xl bg-white transition-all duration-300 cursor-pointer group relative">
                  <a href="https://rbs-homes.com/map?activeTypes=sale" target="_self">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow float-left stroke-2">
                      <Building className="w-6 h-6 text-orange-500" />
                    </div>
                    <h6 className="text-base font-bold text-gray-800 p-9 absolute inset-y-0 right-0 w-auto text-nowrap">
                        Buy
                    </h6>
                  </a>
                </div>
                <div className="col-span-2 row-span-1 row-start-2 p-6 h-auto border border-gray-200  rounded-xl bg-white transition-all duration-300 cursor-pointer group relative">
                  <a href="https://rbs-homes.com/map?activeTypes=preSale" target="_self">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow float-left">
                      <TrendingUp className="w-6 h-6 text-orange-500" />
                    </div>
                    <h6 className="text-base font-bold text-gray-800 p-9 absolute inset-y-0 right-0 w-auto text-nowrap">
                      Pre-Sale
                    </h6>
                  </a>
                </div>  
              </div>
          </div>
          <div className="max-w-6xl p-3">
            <div className="grid gap-4 customize-margin">
              <a className="bg-white  border border-gray-200 rounded-xl p-4 transition-all duration-300 group" href="/list">
                <div className="flex items-center justify-between"><div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <List className="w-5 h-5 text-gray-600" />
                        </div>
                    <div className="text-left">
                      <h4 className="text-base font-semibold text-gray-800">View as List</h4>
                      <p className="text-sm text-gray-500">Browse all properties</p>
                      </div>
                      </div>
                      <div className="w-8 h-8 bg-gray-100 group-hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors">
                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
                      </div>
                </div>
              </a>  
              <a className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl p-4 transition-all duration-300 group shadow-lg hover:shadow-xl" href="/map">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <MapPin className="w-5 h-5 text-white animate-bounce" />
                        </div>
                  <div className="text-left"><h4 className="text-base font-semibold text-white">View on Map</h4><p className="text-sm text-orange-100">Explore locations</p></div></div>
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                  </div>
                  </a>
            </div>
          </div>
      </div>
    </>
  );
};

export default HeroSection;