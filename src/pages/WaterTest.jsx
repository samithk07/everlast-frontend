import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const TDSAdjuster = () => {
    const [tdsLevel, setTdsLevel] = useState(500);
    const [recommendedPurifier, setRecommendedPurifier] = useState('');

    // Purifier recommendations based on TDS levels
    const purifierRecommendations = {
        low: {
            range: "0-200 ppm",
            purifiers: [
                "UV Water Purifier",
                "UF Water Purifier",
                "Basic RO + UV Purifier"
            ],
            description: "For low TDS water, UV/UF purifiers are sufficient to remove bacteria and viruses."
        },
        medium: {
            range: "201-500 ppm",
            purifiers: [
                "RO + UV Water Purifier",
                "RO + UF Water Purifier",
                "Standard RO Purifier"
            ],
            description: "Medium TDS water requires RO purification to remove dissolved salts and impurities."
        },
        high: {
            range: "501-1000 ppm",
            purifiers: [
                "Advanced RO + UV + UF Purifier",
                "Mineral RO Water Purifier",
                "High TDS RO System"
            ],
            description: "High TDS water needs advanced RO systems with multiple purification stages."
        },
        veryHigh: {
            range: "1000+ ppm",
            purifiers: [
                "Commercial Grade RO System",
                "Industrial Water Purifier",
                "Multi-stage RO with TDS Controller"
            ],
            description: "Very high TDS requires commercial-grade systems with TDS control features."
        }
    };

    const handleTdsChange = (event) => {
        const value = parseInt(event.target.value);
        setTdsLevel(value);
        recommendPurifier(value);
    };

    const recommendPurifier = (tdsValue) => {
        let recommendation;

        if (tdsValue <= 200) {
            recommendation = purifierRecommendations.low;
        } else if (tdsValue <= 500) {
            recommendation = purifierRecommendations.medium;
        } else if (tdsValue <= 1000) {
            recommendation = purifierRecommendations.high;
        } else {
            recommendation = purifierRecommendations.veryHigh;
        }

        setRecommendedPurifier(recommendation);
    };

    // const handleStartWaterCheck = () => {
    //     recommendPurifier(tdsLevel);
    // };

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-[#CDF5FD] flex items-center justify-center px-4">

                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Find the Perfect Purifier for Your Water
                        </h1>
                        <p className="text-lg text-gray-600">
                            Adjust the TDS level to see recommended purifiers
                        </p>
                    </div>

                    {/* TDS Range Labels */}
                    <div className="flex justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">Low TDS (0-200)</span>
                        <span className="text-sm font-medium text-gray-700">High TDS (1000+)</span>
                    </div>

                    {/* Slider Container */}
                    <div className="mb-8">
                        <div className="relative">
                            <input
                                type="range"
                                min="0"
                                max="1500"
                                value={tdsLevel}
                                onChange={handleTdsChange}
                                className="w-full h-3 bg-linear-to-r from-[#00A9FF] to-[#A0E9FF] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00A9FF] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:bg-[#89CFF3] [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#00A9FF] [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:bg-[#89CFF3]"
                            />
                        </div>
                        <div className="text-center mt-4">
                            <span className="inline-block bg-[#00A9FF] text-white px-6 py-3 rounded-full text-lg font-semibold shadow-md">
                                {tdsLevel} ppm
                            </span>
                        </div>
                    </div>

                    

                    {/* Recommendations Section */}
                    {recommendedPurifier && (
                        <div className="bg-linear-to-br from-[#CDF5FD] to-[#A0E9FF] rounded-2xl p-6 shadow-lg border border-[#89CFF3]">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                                Recommended Purifiers for {recommendedPurifier.range}
                            </h3>
                            <p className="text-gray-700 text-center mb-6 text-lg">
                                {recommendedPurifier.description}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {recommendedPurifier.purifiers.map((purifier, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-xl p-4 text-center shadow-md border border-[#89CFF3] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <span className="text-gray-800 font-semibold text-lg">
                                            {purifier}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default TDSAdjuster;