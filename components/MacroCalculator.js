"use client";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
const calculateBMR = (
  weight,
  weightUnit,
  heightUnit,
  heightCm,
  heightFeet,
  heightInches,
  age,
  gender
) => {
  // Convert weight to pounds with higher precision
  const weightLbs =
    weightUnit === "kg" ? weight * 2.20462262185 : parseFloat(weight);

  // Convert height to inches with higher precision
  let heightInchesTotal;
  if (heightUnit === "cm") {
    heightInchesTotal = heightCm / 2.54;
  } else {
    heightInchesTotal =
      parseFloat(heightFeet) * 12 + (parseFloat(heightInches) || 0);
  }

  // Gender-specific Harris-Benedict BMR Formula with exact coefficients
  if (gender === "male") {
    return (
      66.473 + 6.23762 * weightLbs + 12.7084 * heightInchesTotal - 6.755 * age
    );
  } else {
    return (
      655.0955 +
      4.33789 * weightLbs +
      4.69798 * heightInchesTotal -
      4.6756 * age
    );
  }
};

const calculateMacros = ({
  weight,
  weightUnit,
  heightUnit,
  heightCm,
  heightFeet,
  heightInches,
  age,
  gender,
  activityLevel,
  goal,
  proteinPct,
  carbsPct,
  fatPct,
}) => {
  // Calculate Basal Metabolic Rate (BMR)
  const bmr = calculateBMR(
    weight,
    weightUnit,
    heightUnit,
    heightCm,
    heightFeet,
    heightInches,
    age,
    gender
  );

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  // Calculate Total Daily Energy Expenditure (TDEE)
  const tdee = bmr * activityMultipliers[activityLevel];

  // Adjust calories based on goal
  const calorieAdjustments = {
    lose_weight: -500,
    maintain: 0,
    gain_weight: 500,
  };

  const dailyCalories = tdee + calorieAdjustments[goal];

  // Calculate macros based on percentages
  const proteinCals = dailyCalories * (proteinPct / 100);
  const carbCals = dailyCalories * (carbsPct / 100);
  const fatCals = dailyCalories * (fatPct / 100);

  // Convert calories to grams
  const proteinG = proteinCals / 4;
  const carbG = carbCals / 4;
  const fatG = fatCals / 9;

  return {
    dailyCalories: Math.round(dailyCalories),
    protein: Math.round(proteinG * 10) / 10,
    carbs: Math.round(carbG * 10) / 10,
    fat: Math.round(fatG * 10) / 10,
    proteinPct: Math.round(proteinPct * 10) / 10,
    carbsPct: Math.round(carbsPct * 10) / 10,
    fatPct: Math.round(fatPct * 10) / 10,
  };
};

const inputClassName =
  "bg-[#F8F9FF] w-full px-3 py-2 rounded-md border border-gray-300 text-black focus:ring-green-500 focus:border-green-500";

const MacroCalculator = () => {
  const [formData, setFormData] = useState({
    weight: "",
    weightUnit: "kg",
    heightUnit: "ft",
    heightCm: "",
    heightFeet: "",
    heightInches: "",
    age: "",
    gender: "male",
    activityLevel: "sedentary",
    goal: "lose_weight",
    proteinPct: 40,
    carbsPct: 40,
    fatPct: 20,
  });

  const [result, setResult] = useState(null);

  const resultRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the form data
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // When changing any percentage field, validate the total
      if (name.endsWith("Pct")) {
        const total =
          Number(name === "proteinPct" ? value : newData.proteinPct) +
          Number(name === "carbsPct" ? value : newData.carbsPct) +
          Number(name === "fatPct" ? value : newData.fatPct);

        // Optional: You could show a warning message here
        const warningElement = document.getElementById("macro-warning");
        if (warningElement) {
          warningElement.textContent =
            total > 100
              ? `Total is ${total}%. Please adjust to equal 100%.`
              : total < 100
              ? `Total is ${total}%. Please adjust to equal 100%.`
              : "";
        }
      }

      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert percentages to numbers and sum them
    const totalPct =
      Number(formData.proteinPct) +
      Number(formData.carbsPct) +
      Number(formData.fatPct);

    // Check if total is 100
    if (totalPct !== 100) {
      toast.error(
        `Your macro split percentages total ${totalPct}%. They must add up to exactly 100%.`
      );
      return;
    }
    const macros = calculateMacros(formData);
    setResult(macros);
    // Show success toast
    toast.success("Macros calculated!");
  };

  // Smooth scrolling effect using requestAnimationFrame
  useEffect(() => {
    if (result) {
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [result]);

  const toggleHeightInputs = (unit) => {
    setFormData((prev) => ({
      ...prev,
      heightUnit: unit,
      heightCm: "",
      heightFeet: "",
      heightInches: "",
    }));
  };

  const MacroRecommendationsPanel = ({ gender, goal }) => {
    const getMacroRecommendation = (gender, goal) => {
      const recommendations = {
        male: {
          lose_weight: { protein: 30, carbs: 40, fat: 30 },
          gain_weight: { protein: "20-30", carbs: "50-60", fat: "20-30" },
          maintain: { protein: "25-30", carbs: "55-60", fat: "15-20" },
        },
        female: {
          lose_weight: { protein: "25-35", carbs: "40-50", fat: "20-30" },
          gain_weight: { protein: "25-35", carbs: "45-55", fat: "20-30" },
          maintain: { protein: "25-30", carbs: "50-55", fat: "20-25" },
        },
      };
      return (
        recommendations[gender]?.[goal] || {
          protein: "30",
          carbs: "40",
          fat: "30",
        }
      );
    };

    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 h-fit sticky top-8">
        <h2 className="text-2xl font-bold text-black text-center mb-6">
          Recommended Split
        </h2>
        <div>
          {gender && goal && (
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="font-bold text-green-800 text-lg mb-4">
                {gender === "male" ? "👨 " : "👩 "}
                Recommended for {gender === "male" ? "Men" : "Women"} -{" "}
                {goal
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                :
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-green-100 rounded">
                  <p className="text-green-700 font-semibold">Protein</p>
                  <p className="text-green-900 font-bold text-lg">
                    {getMacroRecommendation(gender, goal).protein}%
                  </p>
                </div>
                <div className="text-center p-3 bg-green-100 rounded">
                  <p className="text-green-700 font-semibold">Carbs</p>
                  <p className="text-green-900 font-bold text-lg">
                    {getMacroRecommendation(gender, goal).carbs}%
                  </p>
                </div>
                <div className="text-center p-3 bg-green-100 rounded">
                  <p className="text-green-700 font-semibold">Fat</p>
                  <p className="text-green-900 font-bold text-lg">
                    {getMacroRecommendation(gender, goal).fat}%
                  </p>
                </div>
              </div>
              <p className="text-green-600 text-sm italic mt-3">
                💡 Select a value within the recommended range based on your
                activity level
              </p>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">
              These recommendations are based on established nutritional
              guidelines for different fitness goals.
            </p>
            <p>
              Adjust the percentages within the recommended ranges based on your
              individual needs and preferences.
            </p>
          </div>
        </div>

        {/* Results section */}
        {result && (
          <div ref={resultRef} className="bg-gray-100 p-4 rounded-lg mt-8">
            <h3 className="text-4xl font-bold text-black text-center">
              Your Daily Macros
            </h3>
            <div className="mt-5 rounded-lg">
              <div className="text-center mb-6">
                <h4 className="text-black text-3xl font-bold">
                  Daily Calories
                </h4>
                <div className="mt-1 text-4xl font-bold text-black">
                  {result.dailyCalories}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-2">
                <div className="text-center p-4 bg-blue-100 rounded-lg shadow">
                  <div className="text-sm text-black">Protein</div>
                  <div className="mt-1 md:text-xl font-bold text-black">
                    {result.protein}g
                  </div>
                  <div className="text-sm text-black">{result.proteinPct}%</div>
                </div>
                <div className="text-center p-4 bg-green-100 rounded-lg shadow">
                  <div className="text-sm text-black">Carbs</div>
                  <div className="mt-1 md:text-xl font-bold text-black">
                    {result.carbs}g
                  </div>
                  <div className="text-sm text-black">{result.carbsPct}%</div>
                </div>
                <div className="text-center p-4 bg-yellow-100 rounded-lg shadow">
                  <div className="text-sm text-black">Fat</div>
                  <div className="mt-1 md:text-xl font-bold text-black">
                    {result.fat}g
                  </div>
                  <div className="text-sm text-black">{result.fatPct}%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Form Column */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden p-8">
              <h1 className="text-3xl font-bold text-black text-center mb-2">
                <span className="text-5xl text-green-600">Fitnum</span> Daily
                Macro Calculator
              </h1>
              <p className="text-center text-black mb-6 text-xl">
                Calculate your daily macros for your fitness goals
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Gender Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-black"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium text-black">
                    Weight
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      step="0.01"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      required
                      className={`${inputClassName} rounded-l-md bg-white`}
                      placeholder="Enter your weight"
                    />
                    <select
                      name="weightUnit"
                      value={formData.weightUnit}
                      onChange={handleInputChange}
                      className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 text-black"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>

                {/* Height Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Height
                  </label>
                  {formData.heightUnit === "ft" ? (
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        name="heightFeet"
                        value={formData.heightFeet}
                        onChange={handleInputChange}
                        className="w-full text-black px-3 py-2 rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500"
                        placeholder="Feet"
                        required={formData.heightUnit === "ft"}
                      />
                      <input
                        type="number"
                        name="heightInches"
                        value={formData.heightInches}
                        onChange={handleInputChange}
                        className="w-full text-black px-3 py-2 rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500"
                        placeholder="Inches"
                      />
                    </div>
                  ) : (
                    <input
                      type="number"
                      step="0.1"
                      name="heightCm"
                      value={formData.heightCm}
                      onChange={handleInputChange}
                      className="w-full text-black px-3 py-2 rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter height in cm"
                      required={formData.heightUnit === "cm"}
                    />
                  )}
                  <div className="mt-2 space-x-6">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="heightUnit"
                        checked={formData.heightUnit === "cm"}
                        onChange={() => toggleHeightInputs("cm")}
                        className="form-radio h-4 w-4 text-green-600"
                      />
                      <span className="ml-2 text-black">Centimeters</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="heightUnit"
                        checked={formData.heightUnit === "ft"}
                        onChange={() => toggleHeightInputs("ft")}
                        className="form-radio h-4 w-4 text-green-600"
                      />
                      <span className="ml-2 text-black">Feet & Inches</span>
                    </label>
                  </div>
                </div>

                {/* Age Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    className="mt-1 text-black w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your age"
                  />
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Activity Level
                  </label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleInputChange}
                    className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="sedentary">
                      Sedentary (little or no exercise)
                    </option>
                    <option value="lightly_active">
                      Lightly Active (1-3 days/week)
                    </option>
                    <option value="moderately_active">
                      Moderately Active (3-5 days/week)
                    </option>
                    <option value="very_active">
                      Very Active (6-7 days/week)
                    </option>
                    <option value="extra_active">
                      Extra Active (very intense exercise)
                    </option>
                  </select>
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Goal
                  </label>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="lose_weight">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain_weight">Gain Weight</option>
                  </select>
                </div>

                {/* Macro Split */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Macro Split (%)
                  </label>
                  <div className="grid grid-cols-3 gap-4 mt-1">
                    <div>
                      <label className="block text-sm text-gray-600">
                        Protein %
                      </label>
                      <input
                        type="number"
                        name="proteinPct"
                        value={formData.proteinPct}
                        onChange={handleInputChange}
                        required
                        className="mt-1 text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Carbs %
                      </label>
                      <input
                        type="number"
                        name="carbsPct"
                        value={formData.carbsPct}
                        onChange={handleInputChange}
                        required
                        className="mt-1 text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Fat %
                      </label>
                      <input
                        type="number"
                        name="fatPct"
                        value={formData.fatPct}
                        onChange={handleInputChange}
                        required
                        className="mt-1 text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <p
                    id="macro-warning"
                    className="mt-2 text-sm text-red-600"
                  ></p>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-3 font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none cursor-pointer"
                >
                  Calculate Macros
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "DISCLAIMER: This calculator is for informational purposes only. The information provided is not medical advice and should not be used as a substitute for professional medical guidance. Always consult with a healthcare provider or registered dietitian before starting any diet or exercise program. By using this calculator, you acknowledge that the creator assumes no responsibility or liability for any consequences resulting from the use of this tool."
                    )
                  }
                  className="text-sm text-green-600 hover:text-green-800 underline cursor-pointer"
                >
                  View Disclaimer
                </button>
              </div>
            </div>
          </div>

          {/* Recommendations and Results Column */}
          <div className="lg:col-span-2">
            <MacroRecommendationsPanel
              gender={formData.gender}
              goal={formData.goal}
              result={result}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MacroCalculator;
