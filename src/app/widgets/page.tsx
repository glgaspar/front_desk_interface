"use client";
import React, { useEffect, useState } from "react";
import AvailableWidgets  from "./availableWidgets";
import Api from "@/Components/Api";
import toast from "react-hot-toast";

export default function Widgets() {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]|undefined>(undefined);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    Api()
      .get("/widgets/selected")
      .then((response) => {
        if (Array.isArray(response?.data?.data)) {
          setSelectedWidgets(response.data.data);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to load widgets");
      })
  }, []);

  
  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-center font-bold">Widgets Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Edit Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {selectedWidgets?.map(widgetToRender => AvailableWidgets[widgetToRender as keyof typeof AvailableWidgets])}
        </div>
        {
          showAll &&
          <>
            <hr className="p-5 border-[#b3078b]" />
            <h4 className="text-[500]">Not Selected Widgets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(AvailableWidgets)
                .filter(([key]) => !selectedWidgets?.includes(key))
                .map(([_, widget]) => React.cloneElement(widget, { selected: false }))}
            </div>
          </>
        }
    </div>
  );
}
